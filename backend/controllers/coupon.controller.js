import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';

// Create a new coupon (Admin only)
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      expiryDate,
      usageLimit,
      isActive,
      isFirstOrderOnly
    } = req.body;

    // Validation
    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: code, discountType, discountValue, expiryDate'
      });
    }

    // Validate discount type
    if (!['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: 'Discount type must be either "percentage" or "fixed"'
      });
    }

    // Validate discount value
    if (discountValue < 0) {
      return res.status(400).json({
        success: false,
        message: 'Discount value cannot be negative'
      });
    }

    // For percentage, max should be 100
    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%'
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    // Validate expiry date
    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime()) || expiry <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be a valid future date'
      });
    }

    // Create coupon
    const coupon = new Coupon({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscount: maxDiscount !== undefined && maxDiscount !== null ? Number(maxDiscount) : null,
      expiryDate: expiry,
      usageLimit: usageLimit !== undefined && usageLimit !== null ? Number(usageLimit) : null,
      isActive: isActive !== undefined ? isActive : true,
      isFirstOrderOnly: isFirstOrderOnly !== undefined ? isFirstOrderOnly : false
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon',
      error: error.message
    });
  }
};

// Get all coupons (Protected): returns active coupons with applicableForUser + unavailableReason (cartTotal query optional)
export const getAllCoupons = async (req, res) => {
  try {
    const { sortBy = 'createdAt', order = 'desc' } = req.query;
    // Use authenticated userId from JWT token (same as applyCoupon)
    const userId = req.userId;

    console.log('[GET /coupons] Checking coupons for authenticated user:', userId);

    // Only return active coupons for users
    let query = { isActive: true };

    const sortOrder = order === 'asc' ? 1 : -1;

    let coupons = await Coupon.find(query)
      .sort({ [sortBy]: sortOrder })
      .lean();

    const cartTotalRaw = req.query.cartTotal;
    const cartTotal =
      cartTotalRaw !== undefined && cartTotalRaw !== null && String(cartTotalRaw).trim() !== ''
        ? Math.max(0, Number(cartTotalRaw))
        : null;

    let hasOrder = false;
    if (userId) {
      let userObjectId;
      try {
        userObjectId = new mongoose.Types.ObjectId(userId);
      } catch {
        userObjectId = userId;
      }
      let orderFound = await Order.findOne({ user: userObjectId });
      if (!orderFound) orderFound = await Order.findOne({ user: userId.toString() });
      if (!orderFound) orderFound = await Order.findOne({ user: userId });
      hasOrder = !!orderFound;
    }

    const now = new Date();
    const enrichedCoupons = coupons.map((coupon) => {
      const isExpired = now > new Date(coupon.expiryDate);
      const isLimitReached = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;
      const firstOrderBlocked = Boolean(coupon.isFirstOrderOnly && hasOrder);
      const minAmt = Number(coupon.minOrderAmount) || 0;
      const belowMin =
        cartTotal !== null && !Number.isNaN(cartTotal) && minAmt > 0 && cartTotal < minAmt;

      let unavailableReason = null;
      if (isExpired) {
        unavailableReason = 'This coupon has expired';
      } else if (isLimitReached) {
        unavailableReason = 'This coupon has reached its usage limit';
      } else if (firstOrderBlocked) {
        unavailableReason = 'Only valid on your first order with us';
      } else if (belowMin) {
        const need = Math.max(0, minAmt - cartTotal);
        unavailableReason = `Minimum order ₹${minAmt.toLocaleString('en-IN')} — add ₹${Math.ceil(need).toLocaleString('en-IN')} more`;
      }

      const applicableForUser = unavailableReason === null;

      return {
        ...coupon,
        status: isExpired ? 'expired' : isLimitReached ? 'limit_reached' : 'active',
        applicableForUser,
        unavailableReason,
      };
    });

    enrichedCoupons.sort((a, b) => {
      if (a.applicableForUser !== b.applicableForUser) return a.applicableForUser ? -1 : 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    res.status(200).json({
      success: true,
      count: enrichedCoupons.length,
      data: enrichedCoupons
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons',
      error: error.message
    });
  }
};

// Delete coupon (Admin only)
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    await Coupon.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon',
      error: error.message
    });
  }
};

// Apply coupon (Public - for users)
export const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount, userId } = req.body;

    console.log('[POST /coupons/apply] Incoming userId:', userId);
    console.log('[POST /coupons/apply] Coupon code:', code);

    if (!code || orderAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide coupon code and order amount'
      });
    }

    const orderTotal = Number(orderAmount);
    if (isNaN(orderTotal) || orderTotal < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount'
      });
    }

    // Find coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    console.log('[POST /coupons/apply] Coupon found:', coupon.code);
    console.log('[POST /coupons/apply] Coupon isFirstOrderOnly:', coupon.isFirstOrderOnly);

    // Check if coupon is first order only
    if (coupon.isFirstOrderOnly) {
      // Use authenticated userId from JWT token (req.userId set by cookieJwtAuth middleware)
      // Ignore userId from body to prevent manipulation
      const requestingUserId = req.userId || req.user?._id;

      console.log('[POST /coupons/apply] Authenticated userId from JWT:', requestingUserId);

      if (!requestingUserId) {
        return res.status(400).json({
          success: false,
          message: 'User ID required for first order coupon'
        });
      }

      // Convert userId to proper ObjectId
      let userObjectId;
      try {
        userObjectId = new mongoose.Types.ObjectId(requestingUserId);
      } catch (e) {
        console.log('[POST /coupons/apply] Invalid userId format:', requestingUserId);
        userObjectId = requestingUserId; // fallback
      }

      // Check if user has any previous orders - try multiple query formats
      let orderFound = await Order.findOne({ user: userObjectId });
      
      if (!orderFound) {
        orderFound = await Order.findOne({ user: requestingUserId.toString() });
      }
      
      if (!orderFound) {
        orderFound = await Order.findOne({ user: requestingUserId });
      }

      const hasOrder = !!orderFound;

      if (orderFound) {
        console.log('[POST /coupons/apply] Order Found: YES - Order ID:', orderFound._id);
        console.log('[POST /coupons/apply] Order user field:', orderFound.user, 'type:', typeof orderFound.user);
      } else {
        console.log('[POST /coupons/apply] Order Found: NO');
      }
      console.log('[POST /coupons/apply] hasOrder:', hasOrder);

      if (hasOrder) {
        console.log('[POST /coupons/apply] BLOCKING: User already has orders, cannot use first order coupon');
        return res.status(400).json({
          success: false,
          message: 'This coupon is only valid for first order users'
        });
      }

      console.log('[POST /coupons/apply] ALLOWING: User has no orders, first order coupon valid');
    }

    // Calculate discount
    const result = coupon.calculateDiscount(orderTotal);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    // Don't increment usedCount here - only do it after successful order placement
    // This is just validation and calculation

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        couponCode: result.couponCode,
        discountType: result.discountType,
        discountValue: result.discountValue,
        discountAmount: result.discountAmount,
        finalAmount: result.finalAmount,
        originalAmount: orderTotal
      }
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply coupon',
      error: error.message
    });
  }
};

// Increment coupon usage (called after successful order)
export const incrementCouponUsage = async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOneAndUpdate(
      { code: code.toUpperCase().trim() },
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon usage updated',
      data: coupon
    });
  } catch (error) {
    console.error('Error incrementing coupon usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon usage',
      error: error.message
    });
  }
};

// Get single coupon (Admin)
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon',
      error: error.message
    });
  }
};

// Update coupon (Admin)
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating code to avoid conflicts
    delete updateData.code;

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon',
      error: error.message
    });
  }
};

// Get all coupons for admin (includes inactive)
export const getAllCouponsAdmin = async (req, res) => {
  try {
    const { sortBy = 'createdAt', order = 'desc' } = req.query;

    const sortOrder = order === 'asc' ? 1 : -1;

    const coupons = await Coupon.find({})
      .sort({ [sortBy]: sortOrder })
      .lean();

    // Add validity info to each coupon
    const now = new Date();
    const enrichedCoupons = coupons.map(coupon => {
      const isExpired = now > new Date(coupon.expiryDate);
      const isLimitReached = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;

      return {
        ...coupon,
        status: !coupon.isActive ? 'inactive' :
                isExpired ? 'expired' :
                isLimitReached ? 'limit_reached' : 'active'
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedCoupons.length,
      data: enrichedCoupons
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons',
      error: error.message
    });
  }
};

// Toggle coupon active status (Admin)
export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Toggle isActive
    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      data: coupon
    });
  } catch (error) {
    console.error('Error toggling coupon status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle coupon status',
      error: error.message
    });
  }
};

