import Product from '../models/Product.js';
import SizeMapping from '../models/SizeMapping.js';
import AssociationRule from '../models/AssociationRule.js';
import User from '../models/User.js';
import { extractIntent, generateResponse, analyzeImage } from '../services/ai.service.js';

// Main AI recommendation endpoint with function calling
export const recommend = async (req, res) => {
  try {
    const { message, imageBase64 } = req.body;
    const userId = req.user?._id;

    let chatHistory = [];
    if (userId) {
      const user = await User.findById(userId).select('chatHistory sizeProfile stylePreferences');
      chatHistory = user?.chatHistory || [];
    }

    let imageAnalysis = null;
    if (imageBase64) {
      imageAnalysis = await analyzeImage(imageBase64);
    }

    const fullMessage = imageAnalysis
      ? `${message || 'What goes with this?'}\n[Image analysis: ${JSON.stringify(imageAnalysis)}]`
      : message;

    // Step 1: Extract intent via LLM function calling
    const { textResponse, intents } = await extractIntent(fullMessage, chatHistory);

    // Step 2: Execute each function call
    const results = {};
    for (const intent of intents) {
      switch (intent.function) {
        case 'search_products':
          const searchResult = await executeProductSearch(intent.args);
          results.products = searchResult.products;
          results.measurementFit = searchResult.measurementFit;
          break;
        case 'check_size_mapping':
          results.sizeMapping = await executeSizeMapping(intent.args);
          break;
        case 'suggest_bundle':
          results.bundle = await executeBundleSuggestion(intent.args);
          break;
      }
    }

    // Step 3: Generate conversational response with search context
    const aiResponse = textResponse || await generateResponse(fullMessage, results, chatHistory);

    // Step 4: Save chat history
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          chatHistory: {
            $each: [
              { role: 'user', content: message, imageUrl: imageBase64 ? 'uploaded' : null },
              { role: 'assistant', content: aiResponse }
            ],
            $slice: -50  // Keep last 50 messages
          }
        }
      });
    }

    res.json({
      message: aiResponse,
      products: results.products || [],
      sizeMapping: results.sizeMapping || null,
      bundle: results.bundle || null,
      imageAnalysis,
      intents: intents.map(i => ({ function: i.function, args: i.args }))
    });
  } catch (error) {
    console.error('AI recommend error:', error);
    res.status(500).json({ error: 'AI recommendation failed. Please try again.' });
  }
};

// Execute product search based on extracted intent
async function executeProductSearch(args) {
  const filter = { isActive: true };

  if (args.categories?.length) {
    filter.category = { $in: args.categories };
  }

  if (args.style_tags?.length) {
    filter.tags = { $in: args.style_tags };
  }

  if (args.occasion) {
    filter.occasion = args.occasion;
  }

  if (args.weather) {
    filter.weather = { $in: [args.weather, 'all-season'] };
  }

  if (args.colors?.length) {
    filter.colors = { $in: args.colors };
  }

  if (args.gender) {
    filter.gender = { $in: [args.gender, 'unisex'] };
  }

  // Handle Height/Width/Weight (Measurement-based filtering)
  let measurementFit = null;
  if (args.height || args.width || args.weight) {
    // Attempt to find a matching size mapping based on dimensions
    const category = args.categories?.[0] || 'shirt';
    measurementFit = await findBestSizeForDimensions({
      height: args.height,
      width: args.width,
      weight: args.weight,
      category
    });

    if (measurementFit) {
      // If we found a recommended size, we can prioritize products that have that size in stock
      // For now, we'll just store it to return in the response
      args.recommendedSize = measurementFit.ourSize;
    }
  }

  // Budget mapping
  if (args.budget) {
    const budgetRanges = {
      low: { $lte: 1000 },
      mid: { $gte: 1000, $lte: 3000 },
      high: { $gte: 3000, $lte: 8000 },
      luxury: { $gte: 8000 }
    };
    filter.price = budgetRanges[args.budget] || {};
  }

  // Urgency → delivery filter
  if (args.urgency === 'immediate' || args.max_delivery_minutes) {
    const maxMin = args.max_delivery_minutes || 30;
    filter['deliveryZones.estimatedMinutes'] = { $lte: maxMin };
  }

  // In stock only
  filter['sizes.stock'] = { $gt: 0 };

  // Step A: Attempt Exact Search
  let products = await Product.find(filter)
    .sort('-rating -reviewCount')
    .limit(10)
    .select('name brand price discountPrice images category tags colors sizes rating gender description');

  // Step B: Similarity Fallback if no exact matches
  if (products.length === 0) {
    const similarityFilter = { 
      isActive: true,
      'sizes.stock': { $gt: 0 },
      category: filter.category // Keep category as anchor
    };

    const candidateProducts = await Product.find(similarityFilter)
      .sort('-rating')
      .limit(50)
      .select('name brand price discountPrice images category tags colors sizes rating gender description');

    // Calculate score for each candidate
    products = candidateProducts.map(p => {
      let score = 0;
      
      // Category Match (40 pts)
      if (args.categories?.includes(p.category)) score += 40;
      else if (p.category === args.primary_category) score += 40;

      // Color Match (20 pts)
      if (args.colors?.some(c => p.colors?.map(pc => pc.toLowerCase()).includes(c.toLowerCase()))) score += 20;

      // Size Match (20 pts)
      if (args.size && p.sizes?.some(s => s.size.toUpperCase() === args.size.toUpperCase() && s.stock > 0)) score += 20;

      // Style/Tag Match (10 pts)
      if (args.style_tags?.some(t => p.tags?.includes(t))) score += 10;

      // Material Match (10 pts) - check description if no field
      const materials = ['cotton', 'linen', 'silk', 'leather', 'denim', 'wool', 'polyester'];
      const targetMaterial = args.material?.toLowerCase();
      if (targetMaterial && p.description?.toLowerCase().includes(targetMaterial)) score += 10;

      return { ...p.toObject(), matchScore: score };
    })
    .filter(p => p.matchScore >= 40) // Must at least match category
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
  } else {
    // Label exact matches as 100%
    products = products.map(p => ({ ...p.toObject(), matchScore: 100 }));
  }

  return { products, measurementFit };
}

// Logic to find best size based on raw dimensions
async function findBestSizeForDimensions({ height, width, weight, category }) {
  // Simple heuristic: search size mappings and find closest measurements
  const mappings = await SizeMapping.find({ category });
  if (!mappings.length) return null;

  let bestMatch = null;
  let minDiff = Infinity;

  mappings.forEach(m => {
    let diff = 0;
    let count = 0;

    if (width && m.measurementsCm.chest) {
      diff += Math.abs(width - m.measurementsCm.chest);
      count++;
    }
    // We can add weight/height heuristics if mappings had them, 
    // but usually size charts focus on chest/waist/length.
    if (m.measurementsCm.length && height) {
      // Assume length is ~ 0.4 * height for shirts
      const estLength = height * 0.4;
      diff += Math.abs(estLength - m.measurementsCm.length) * 0.5;
      count++;
    }

    if (count > 0) {
      const avgDiff = diff / count;
      if (avgDiff < minDiff) {
        minDiff = avgDiff;
        bestMatch = m;
      }
    }
  });

  if (bestMatch && minDiff < 10) { // Only suggest if it's reasonably close (within 10cm)
    return {
      ourSize: bestMatch.ourBrandSize,
      fitNotes: bestMatch.fitNotes,
      measurements: bestMatch.measurementsCm,
      confidence: Math.max(0, 1 - (minDiff / 20))
    };
  }

  return null;
}

// Execute size mapping lookup
async function executeSizeMapping(args) {
  const mapping = await SizeMapping.findOne({
    referenceBrand: new RegExp(args.brand, 'i'),
    referenceSize: args.size,
    category: args.category
  });

  if (mapping) {
    return {
      found: true,
      referenceBrand: mapping.referenceBrand,
      referenceSize: mapping.referenceSize,
      ourSize: mapping.ourBrandSize,
      fitNotes: mapping.fitNotes,
      measurements: mapping.measurementsCm
    };
  }

  return {
    found: false,
    suggestion: `We don't have an exact mapping for ${args.brand} ${args.size} in ${args.category} yet. Based on standard sizing, we recommend trying our size ${args.size}.`
  };
}

// Execute bundle suggestion
async function executeBundleSuggestion(args) {
  const rules = await AssociationRule.find({
    triggerCategory: args.primary_category,
    isActive: true
  })
    .sort('-confidence')
    .limit(3)
    .populate('suggestedProducts', 'name price discountPrice images brand category');

  if (rules.length > 0) {
    return {
      bundleName: rules[0].bundleName,
      discount: rules[0].bundleDiscount,
      items: rules[0].suggestedProducts,
      confidence: rules[0].confidence
    };
  }

  // Fallback: suggest complementary categories
  const complementary = {
    dress: ['jewelry', 'bag', 'shoes'],
    shirt: ['jeans', 'shoes', 'accessory'],
    jeans: ['shirt', 'shoes', 'jacket'],
    tshirt: ['jeans', 'shorts', 'shoes'],
    jacket: ['shirt', 'jeans', 'accessory']
  };

  const cats = complementary[args.primary_category] || ['accessory', 'shoes'];
  const products = await Product.find({
    category: { $in: cats },
    'sizes.stock': { $gt: 0 }
  }).limit(3).select('name price discountPrice images brand category');

  return {
    bundleName: `Complete ${args.primary_category} look`,
    discount: 15,
    items: products,
    confidence: 0.7
  };
}

// Get chat history
export const getChatHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('chatHistory');
    res.json({ chatHistory: user?.chatHistory || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history.' });
  }
};

// Clear chat history
export const clearChatHistory = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { chatHistory: [] });
    res.json({ message: 'Chat history cleared.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear chat history.' });
  }
};

// Smart Fit endpoint
export const smartFit = async (req, res) => {
  try {
    const { brand, size, category } = req.body;
    const result = await executeSizeMapping({ brand, size, category });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Smart Fit lookup failed.' });
  }
};

// Occasion search endpoint
export const occasionSearch = async (req, res) => {
  try {
    const { description, zip, maxDeliveryMinutes = 30 } = req.body;

    const { intents } = await extractIntent(description);
    const searchIntent = intents.find(i => i.function === 'search_products');

    if (searchIntent) {
      searchIntent.args.max_delivery_minutes = maxDeliveryMinutes;
      const { products, measurementFit } = await executeProductSearch(searchIntent.args);
      res.json({
        products,
        measurementFit,
        extractedIntent: searchIntent.args,
        deliveryFilter: `${maxDeliveryMinutes} min delivery`
      });
    } else {
      res.json({ products: [], extractedIntent: null });
    }
  } catch (error) {
    console.error('Occasion search failed:', error);
    res.status(500).json({ error: 'Occasion search failed.' });
  }
};
