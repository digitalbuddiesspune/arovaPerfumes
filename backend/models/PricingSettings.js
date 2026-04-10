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
    }
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
