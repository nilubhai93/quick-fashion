import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import AssociationRule from '../models/AssociationRule.js';

export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.productId', 'name price discountPrice images brand category sizes rentPricePerDay isAvailableForRent')
      .populate('bundleSuggestion.suggestedItems', 'name price discountPrice images brand category');

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const cartItems = cart.items.map(item => ({
      _id: item._id,
      product: item.productId,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      isRental: item.isRental || false,
      rentalDays: item.rentalDays || 0
    }));

    const subtotal = cartItems.reduce((sum, item) => {
      if (item.isRental && item.rentalDays > 0) {
        const rentPerDay = item.product?.rentPricePerDay || 0;
        return sum + rentPerDay * item.rentalDays * item.quantity;
      }
      const price = item.product?.discountPrice || item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    res.json({
      items: cartItems,
      bundleSuggestion: cart.bundleSuggestion,
      subtotal,
      itemCount: cartItems.length
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart.' });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, size, color, quantity = 1, isRental = false, rentalDays = 0 } = req.body;

    let product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const sizeObj = product.sizes.find(s => s.size === size);
    if (!sizeObj || sizeObj.stock < quantity) {
      return res.status(400).json({ error: 'Selected size is out of stock.' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      i => i.productId.toString() === productId && i.size === size && i.isRental === isRental
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      if (isRental) existingItem.rentalDays = rentalDays;
    } else {
      cart.items.push({ productId, size, color, quantity, isRental, rentalDays });
    }

    // Check for bundle suggestions (Flash-Bundle AI)
    try {
      const rules = await AssociationRule.find({
        triggerCategory: product.category,
        isActive: true,
        confidence: { $gte: 0.5 }
      }).populate('suggestedProducts', 'name price discountPrice images brand category')
        .sort('-confidence')
        .limit(1);

      if (rules.length > 0) {
        const rule = rules[0];
        const suggestedIds = rule.suggestedProducts
          .filter(p => !cart.items.some(i => i.productId.toString() === p._id.toString()))
          .map(p => p._id);

        if (suggestedIds.length > 0) {
          cart.bundleSuggestion = {
            isActive: true,
            bundleName: rule.bundleName || `${product.category} Bundle`,
            suggestedItems: suggestedIds,
            discount: rule.bundleDiscount || 15,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000)
          };
        }
      }
    } catch (e) {
      // Bundle suggestion is optional
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price discountPrice images brand category sizes')
      .populate('bundleSuggestion.suggestedItems', 'name price discountPrice images brand category');

    res.json({
      message: 'Added to cart',
      cart: populatedCart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add to cart.' });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ error: 'Cart not found.' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ error: 'Item not in cart.' });

    if (quantity <= 0) {
      cart.items.pull(itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart.' });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ error: 'Cart not found.' });

    cart.items.pull(itemId);
    await cart.save();
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item.' });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: [], bundleSuggestion: { isActive: false } }
    );
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cart.' });
  }
};

export const acceptBundle = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || !cart.bundleSuggestion?.isActive) {
      return res.status(400).json({ error: 'No active bundle suggestion.' });
    }

    for (const productId of cart.bundleSuggestion.suggestedItems) {
      const product = await Product.findById(productId);
      if (product && product.sizes.length > 0) {
        const availableSize = product.sizes.find(s => s.stock > 0);
        if (availableSize) {
          cart.items.push({
            productId: product._id,
            size: availableSize.size,
            quantity: 1
          });
        }
      }
    }

    cart.bundleSuggestion.isActive = false;
    await cart.save();

    res.json({ message: 'Bundle accepted! Items added to cart.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept bundle.' });
  }
};
