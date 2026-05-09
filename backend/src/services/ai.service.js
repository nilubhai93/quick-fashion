import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are StyleAI, an expert fashion stylist for a quick-commerce fashion app. You help users find the perfect outfit based on their needs.

Your capabilities:
1. Understand occasion-based requests (wedding, party, office, date, casual outing)
2. Consider weather and temperature in recommendations
3. Understand urgency (need it in 30 min vs. planning ahead)
4. Suggest complete outfits with accessories
5. Help with sizing using brand comparisons OR user's physical dimensions (height, width/chest, weight)
6. Create bundle deals for coordinated looks

Always be enthusiastic, fashionable, and helpful. Use emojis sparingly. Keep responses concise but informative.
When suggesting products, call the search_products function with extracted parameters. 
If the user provides height/width/weight, include them in the function call so we can recommend the perfect fit.`;

const FUNCTION_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Search the product catalog based on extracted fashion intent from user message',
      parameters: {
        type: 'object',
        properties: {
          occasion: {
            type: 'string',
            description: 'The occasion or event (wedding, party, office, date, casual, funeral, interview, graduation, beach, gym)'
          },
          urgency: {
            type: 'string',
            enum: ['immediate', 'today', 'this_week', 'no_rush'],
            description: 'How urgently the user needs the items'
          },
          weather: {
            type: 'string',
            description: 'Weather condition or temperature preference (hot, cold, mild, rainy, specific temp like 18C)'
          },
          style_tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Style descriptors (formal, casual, trendy, bohemian, minimalist, streetwear, vintage, classic, layering, semi-formal)'
          },
          categories: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific product categories to search (dress, shirt, jeans, tshirt, jacket, accessory, shoes, outerwear, skirt, shorts, sweater, bag, jewelry)'
          },
          colors: {
            type: 'array',
            items: { type: 'string' },
            description: 'Preferred colors'
          },
          budget: {
            type: 'string',
            enum: ['low', 'mid', 'high', 'luxury'],
            description: 'Budget range'
          },
          max_delivery_minutes: {
            type: 'number',
            description: 'Maximum acceptable delivery time in minutes'
          },
          gender: {
            type: 'string',
            enum: ['men', 'women', 'unisex'],
            description: 'Gender preference for products'
          },
          material: {
            type: 'string',
            description: 'The fabric or material (cotton, linen, silk, leather, denim, wool, polyester)'
          },
          size: {
            type: 'string',
            description: 'Specific size (S, M, L, XL, XS, 28, 30, 32, 34)'
          },
          height: {
            type: 'number',
            description: 'User height in cm'
          },
          width: {
            type: 'number',
            description: 'User width/chest measurement in cm'
          },
          weight: {
            type: 'number',
            description: 'User weight in kg'
          }
        },
        required: ['style_tags']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'check_size_mapping',
      description: 'Check size mapping when user mentions a brand and size they wear',
      parameters: {
        type: 'object',
        properties: {
          brand: {
            type: 'string',
            description: 'The brand the user currently wears (e.g., Levis, Zara, H&M)'
          },
          size: {
            type: 'string',
            description: 'The size they wear in that brand (e.g., 32, M, L)'
          },
          category: {
            type: 'string',
            description: 'The clothing category (jeans, shirt, dress, etc.)'
          }
        },
        required: ['brand', 'size', 'category']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'suggest_bundle',
      description: 'Suggest a coordinated bundle of items that go well together',
      parameters: {
        type: 'object',
        properties: {
          primary_category: {
            type: 'string',
            description: 'The main item category the user is interested in'
          },
          style: {
            type: 'string',
            description: 'The overall style theme for the bundle'
          },
          budget: {
            type: 'string',
            enum: ['low', 'mid', 'high', 'luxury']
          }
        },
        required: ['primary_category']
      }
    }
  }
];

export const extractIntent = async (message, chatHistory = []) => {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...chatHistory.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools: FUNCTION_DEFINITIONS,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 1000
    });

    const choice = response.choices[0];
    const toolCalls = choice.message.tool_calls;
    const textResponse = choice.message.content;

    const extractedIntents = [];
    if (toolCalls) {
      for (const call of toolCalls) {
        try {
          extractedIntents.push({
            function: call.function.name,
            args: JSON.parse(call.function.arguments),
            id: call.id
          });
        } catch (e) {
          console.error('Failed to parse function args:', e);
        }
      }
    }

    return {
      textResponse,
      intents: extractedIntents,
      rawMessage: choice.message
    };
  } catch (error) {
    console.error('Intent extraction error:', error);
    // Fallback: basic keyword extraction
    return fallbackIntentExtraction(message);
  }
};

export const generateResponse = async (message, context, chatHistory = []) => {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...chatHistory.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    // Add context from search results
    if (context) {
      messages.push({
        role: 'system',
        content: `Here are the search results to present to the user:\n${JSON.stringify(context, null, 2)}\n\nPresent these items in an engaging, fashion-forward way. Mention specific product names, prices, and why they match the user's request.`
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 800
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Generate response error:', error);
    
    // Smart fallback if LLM fails
    if (context?.products?.length > 0) {
      const bestMatch = context.products[0];
      const count = context.products.length;
      return `I found ${count} great option${count > 1 ? 's' : ''} for you! Based on your request, I highly recommend the ${bestMatch.name}${bestMatch.matchScore === 100 ? '. It is an exact match for what you are looking for!' : ' as a very close match.'} ✨`;
    }
    
    return "I'm here to help you find the perfect outfit! I couldn't find an exact match for that specific request right now, but feel free to try another style or occasion! 👗✨";
  }
};

export const analyzeImage = async (imageBase64) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a fashion expert. Analyze the uploaded clothing image and describe: 1) Type of garment, 2) Color and pattern, 3) Style category (casual, formal, etc.), 4) Suggested items that would complement this piece. Return as JSON with keys: garment_type, colors, patterns, style_tags, complementary_items.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this clothing item and suggest matching pieces from our store.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      return { raw: content };
    }
  } catch (error) {
    console.error('Image analysis error:', error);
    return null;
  }
};

// Fallback intent extraction when API is unavailable
function fallbackIntentExtraction(message) {
  const lower = message.toLowerCase();
  const intent = { function: 'search_products', args: { style_tags: [] } };

  // Occasion detection
  const occasions = {
    'wedding': ['wedding', 'shaadi', 'marriage'],
    'party': ['party', 'club', 'rooftop', 'celebration', 'birthday'],
    'office': ['office', 'work', 'meeting', 'interview', 'professional'],
    'date': ['date', 'dinner', 'romantic'],
    'casual': ['casual', 'chill', 'hangout', 'everyday'],
    'gym': ['gym', 'workout', 'exercise', 'sports'],
    'beach': ['beach', 'pool', 'summer']
  };

  for (const [occ, keywords] of Object.entries(occasions)) {
    if (keywords.some(k => lower.includes(k))) {
      intent.args.occasion = occ;
      break;
    }
  }

  // Urgency detection
  if (lower.match(/(\d+)\s*(hour|hr|min)/i) || lower.includes('urgent') || lower.includes('asap') || lower.includes('now')) {
    intent.args.urgency = 'immediate';
    const timeMatch = lower.match(/(\d+)\s*(hour|hr)/i);
    if (timeMatch) {
      intent.args.max_delivery_minutes = parseInt(timeMatch[1]) * 60;
    }
    const minMatch = lower.match(/(\d+)\s*min/i);
    if (minMatch) {
      intent.args.max_delivery_minutes = parseInt(minMatch[1]);
    }
  }

  // Weather detection
  const tempMatch = lower.match(/(\d+)\s*°?\s*[cf]/i);
  if (tempMatch) {
    const temp = parseInt(tempMatch[1]);
    intent.args.weather = temp < 15 ? 'cold' : temp > 30 ? 'hot' : 'mild';
  }
  if (lower.includes('cold') || lower.includes('winter')) intent.args.weather = 'cold';
  if (lower.includes('hot') || lower.includes('summer')) intent.args.weather = 'hot';
  if (lower.includes('rain')) intent.args.weather = 'rainy';

  // Style tags
  const styleTags = ['formal', 'casual', 'trendy', 'bohemian', 'minimalist', 'streetwear', 'vintage', 'classic', 'layering', 'semi-formal'];
  intent.args.style_tags = styleTags.filter(t => lower.includes(t));
  if (intent.args.style_tags.length === 0) intent.args.style_tags = ['trendy'];

  // Category detection
  const categories = ['dress', 'shirt', 'jeans', 'tshirt', 'jacket', 'shoes', 'bag', 'jewelry', 'accessory', 'skirt', 'shorts', 'sweater'];
  intent.args.categories = categories.filter(c => lower.includes(c));

  // Color detection
  const colors = ['black', 'white', 'red', 'blue', 'green', 'pink', 'yellow', 'purple', 'navy', 'beige', 'grey', 'gray', 'silver', 'gold', 'brown'];
  intent.args.colors = colors.filter(c => lower.includes(c));

  // Material detection
  const materials = ['cotton', 'linen', 'silk', 'leather', 'denim', 'wool', 'polyester', 'nylon'];
  const foundMaterial = materials.find(m => lower.includes(m));
  if (foundMaterial) intent.args.material = foundMaterial;

  // Size detection
  const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl', '28', '30', '32', '34', '36', '38'];
  const foundSize = sizes.find(s => {
    const reg = new RegExp(`\\b${s}\\b`, 'i');
    return reg.test(lower);
  });
  if (foundSize) intent.args.size = foundSize.toUpperCase();

  // Size mapping check
  const sizeMatch = lower.match(/(levi'?s?|zara|h&m|nike|adidas|uniqlo)\s+(\d+|xs|s|m|l|xl|xxl)/i);
  if (sizeMatch) {
    return {
      textResponse: null,
      intents: [
        intent,
        {
          function: 'check_size_mapping',
          args: {
            brand: sizeMatch[1],
            size: sizeMatch[2],
            category: intent.args.categories?.[0] || 'shirt'
          }
        }
      ]
    };
  }

  return {
    textResponse: null,
    intents: [intent]
  };
}

export default { extractIntent, generateResponse, analyzeImage };
