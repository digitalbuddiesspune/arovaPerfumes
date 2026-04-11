import mongoose from 'mongoose';

const pricingSettingsSchema = new mongoose.Schema(
  {
    // Tax settings
    taxPercentage: {
      type: Number,
      default: 5,
      min: 0,
      max: 100
    },
    
    // Shipping settings
    shippingCharge: {
      type: Number,
      default: 50,
      min: 0
    },
    
    // Free shipping threshold
    freeShippingMinAmount: {
      type: Number,
      default: 500,
      min: 0
    },
    
    // Enable/disable free shipping
    isFreeShippingEnabled: {
      type: Boolean,
      default: true
    },

    // Top-of-site scrolling offer line (storefront)
    announcementMarquee: {
      type: String,
      default:
        '• 1st Order - 50% Off • USE CODE SMELLGOOD5 TO GET EXTRA 5% OFF ON PREPAID ORDERS • GET A FREE SAMPLE ON EVERY ORDER •',
      maxlength: 2000,
      trim: true,
    },

    // When stock is 1..N (and no conflicting tag), show "Only Few Left" on cards. Set 0 to disable auto badge.
    lowStockThreshold: {
      type: Number,
      default: 8,
      min: 0,
      max: 9999,
    },
  },
  { timestamps: true }
);

// Ensure only one document exists - singleton pattern
pricingSettingsSchema.statics.getSingleton = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const PricingSettings = mongoose.models.PricingSettings || mongoose.model('PricingSettings', pricingSettingsSchema);
export default PricingSettings;
export { PricingSettings };
