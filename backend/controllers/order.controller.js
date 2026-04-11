import Order from '../models/Order.js';
import mongoose from 'mongoose';

/** Pull 8+ hex run from pasted text (handles "#ID", spaces, labels); avoids mangling strings like "order-…". */
const extractOrderHexFromParam = (raw) => {
  const t = String(raw || '').trim().replace(/^#/, '').trim();
  if (!t) return '';
  const runs = t.match(/[0-9a-f]{8,}/gi);
  if (runs?.length) {
    return runs.sort((a, b) => b.length - a.length)[0].toLowerCase();
  }
  return t.replace(/[^0-9a-f]/gi, '').toLowerCase();
};

// Helper function to format order for frontend
const formatOrderForFrontend = (order) => {
  // Get price details with fallbacks (use nullish coalescing ?? to preserve 0 as valid value)
  const itemsPrice = order.itemsPrice ?? order.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) ?? 0;
  const taxPrice = order.taxPrice ?? Math.round(itemsPrice * 0.05) ?? 0;
  const shippingPrice = order.shippingPrice ?? (itemsPrice >= 5000 ? 0 : 99) ?? 0;
  const discount = order.discount ?? order.couponDiscount ?? 0;
  const totalPrice = order.totalPrice ?? (itemsPrice + taxPrice + shippingPrice - discount) ?? order.amount ?? 0;
  
  return {
    _id: order._id,
    orderId: order._id.toString().slice(-8).toUpperCase(), // Short order ID
    createdAt: order.createdAt,
    orderStatus: order.orderStatus || order.status || 'pending',
    paymentStatus: order.paymentStatus || (order.isPaid ? 'paid' : 'pending'),
    paymentMethod: order.paymentMethod || 'cod',
    isPaid: order.isPaid || false,
    paidAt: order.paidAt,
    
    // Items with details
    items: (order.items || []).map(item => ({
      productId: item.product?._id || item.product,
      name: item.name || item.product?.title || item.product?.name || 'Product',
      image: item.image || item.product?.images?.[0] || item.product?.images?.image1 || item.product?.image || '',
      quantity: item.quantity || 1,
      price: item.price || 0,
      size: item.size
    })),
    
    // Price breakdown
    priceDetails: {
      itemsPrice,
      taxPrice,
      shippingPrice,
      discount,
      totalPrice,
      couponCode: order.couponCode
    },
    
    // Shipping address
    shippingAddress: order.shippingAddress || {}
  };
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const orders = await Order.find({ user: userObjectId })
      .sort({ createdAt: -1 })
      .populate('items.product');

    // Format orders for frontend
    const formattedOrders = orders.map(formatOrderForFrontend);

    return res.json({
      success: true,
      orders: formattedOrders,
      count: formattedOrders.length
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch orders', 
      error: err.message 
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const rawInput = String(
      req.query?.q ??
      req.query?.code ??
      req.params?.id ??
      ''
    ).trim();

    const hex = extractOrderHexFromParam(rawInput);
    let order = null;

    if (hex.length === 24 && mongoose.isValidObjectId(hex)) {
      order = await Order.findOne({ _id: hex, user: userObjectId }).populate('items.product');
    } else if (hex.length >= 8) {
      // Match the same 8-char display code as formatOrderForFrontend (last 8 hex of ObjectId).
      // Scan user orders by _id only — avoids $expr / Mongo version quirks so short codes always work.
      const suffix = hex.slice(-8).toUpperCase();
      const oidRows = await Order.find({ user: userObjectId }).select('_id').lean();
      const matchingIds = oidRows
        .filter((row) => String(row._id).slice(-8).toUpperCase() === suffix)
        .map((row) => row._id);
      if (matchingIds.length === 0) {
        order = null;
      } else if (matchingIds.length > 1) {
        return res.status(400).json({
          success: false,
          message:
            'Multiple orders match this code. Use the full Order ID from your confirmation email or open My Orders in your profile.',
        });
      } else {
        order = await Order.findOne({ _id: matchingIds[0], user: userObjectId }).populate('items.product');
      }
    } else {
      return res.status(400).json({
        success: false,
        message:
          'Invalid order ID. Enter the full ID from your order confirmation, or the 8-character order code from My Orders.',
      });
    }

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Format order for frontend
    const formattedOrder = formatOrderForFrontend(order);

    return res.json({
      success: true,
      order: formattedOrder
    });
  } catch (err) {
    console.error('Error fetching order:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch order', 
      error: err.message 
    });
  }
};
