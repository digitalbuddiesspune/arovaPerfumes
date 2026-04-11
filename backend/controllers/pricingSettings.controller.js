import PricingSettings from '../models/PricingSettings.js';

const defaultAnnouncement =
  '• 1st Order - 50% Off • USE CODE SMELLGOOD5 TO GET EXTRA 5% OFF ON PREPAID ORDERS • GET A FREE SAMPLE ON EVERY ORDER •';

// GET /api/settings/pricing - Get current pricing settings
export const getPricingSettings = async (req, res) => {
  try {
    const settings = await PricingSettings.getSingleton();
    return res.json({
      success: true,
      settings: {
        taxPercentage: settings.taxPercentage,
        shippingCharge: settings.shippingCharge,
        freeShippingMinAmount: settings.freeShippingMinAmount,
        isFreeShippingEnabled: settings.isFreeShippingEnabled,
        announcementMarquee: settings.announcementMarquee?.trim() || defaultAnnouncement,
        lowStockThreshold:
          typeof settings.lowStockThreshold === 'number' ? settings.lowStockThreshold : 8,
      }
    });
  } catch (err) {
    console.error('Error fetching pricing settings:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing settings',
      error: err.message
    });
  }
};

// PUT /api/settings/pricing - Update pricing settings (Admin only)
export const updatePricingSettings = async (req, res) => {
  try {
    const {
      taxPercentage,
      shippingCharge,
      freeShippingMinAmount,
      isFreeShippingEnabled,
      announcementMarquee,
      lowStockThreshold,
    } = req.body;

    // Validation
    if (taxPercentage !== undefined && (taxPercentage < 0 || taxPercentage > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Tax percentage must be between 0 and 100'
      });
    }

    if (shippingCharge !== undefined && shippingCharge < 0) {
      return res.status(400).json({
        success: false,
        message: 'Shipping charge cannot be negative'
      });
    }

    if (freeShippingMinAmount !== undefined && freeShippingMinAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Free shipping minimum amount cannot be negative'
      });
    }

    if (announcementMarquee !== undefined && announcementMarquee !== null) {
      const s = String(announcementMarquee).trim();
      if (s.length > 2000) {
        return res.status(400).json({
          success: false,
          message: 'Announcement text must be at most 2000 characters',
        });
      }
    }

    if (lowStockThreshold !== undefined && lowStockThreshold !== null) {
      const n = Number(lowStockThreshold);
      if (Number.isNaN(n) || n < 0 || n > 9999) {
        return res.status(400).json({
          success: false,
          message: 'Low-stock threshold must be a number from 0 to 9999 (0 = auto badge off)',
        });
      }
    }

    const settings = await PricingSettings.getSingleton();

    // Update fields
    if (taxPercentage !== undefined) settings.taxPercentage = Number(taxPercentage);
    if (shippingCharge !== undefined) settings.shippingCharge = Number(shippingCharge);
    if (freeShippingMinAmount !== undefined) settings.freeShippingMinAmount = Number(freeShippingMinAmount);
    if (isFreeShippingEnabled !== undefined) settings.isFreeShippingEnabled = Boolean(isFreeShippingEnabled);
    if (announcementMarquee !== undefined) {
      const s = String(announcementMarquee).trim();
      settings.announcementMarquee = s || defaultAnnouncement;
    }
    if (lowStockThreshold !== undefined) settings.lowStockThreshold = Number(lowStockThreshold);

    await settings.save();

    return res.json({
      success: true,
      message: 'Pricing settings updated successfully',
      settings: {
        taxPercentage: settings.taxPercentage,
        shippingCharge: settings.shippingCharge,
        freeShippingMinAmount: settings.freeShippingMinAmount,
        isFreeShippingEnabled: settings.isFreeShippingEnabled,
        announcementMarquee: settings.announcementMarquee?.trim() || defaultAnnouncement,
        lowStockThreshold:
          typeof settings.lowStockThreshold === 'number' ? settings.lowStockThreshold : 8,
      }
    });
  } catch (err) {
    console.error('Error updating pricing settings:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update pricing settings',
      error: err.message
    });
  }
};

// Helper function to get settings for order calculation
export const getPricingSettingsForCalculation = async () => {
  try {
    const settings = await PricingSettings.getSingleton();
    return {
      taxPercentage: settings.taxPercentage,
      shippingCharge: settings.shippingCharge,
      freeShippingMinAmount: settings.freeShippingMinAmount,
      isFreeShippingEnabled: settings.isFreeShippingEnabled
    };
  } catch (err) {
    console.error('Error getting pricing settings for calculation:', err);
    // Return default values if DB fails
    return {
      taxPercentage: 5,
      shippingCharge: 50,
      freeShippingMinAmount: 500,
      isFreeShippingEnabled: true
    };
  }
};
