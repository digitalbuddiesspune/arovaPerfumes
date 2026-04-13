import mongoose from 'mongoose';

const indianMobileRegex = /^[6-9]\d{9}$/;
const fullNameRegex = /^[A-Za-z]+(?:\s+[A-Za-z]+)+$/;

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fullName: {
    type: String,
    required: true,
    validate: {
      validator: (value) => fullNameRegex.test(String(value || '').trim()),
      message: 'Full name must include at least first name and last name',
    },
  },
  mobileNumber: {
    type: String,
    required: true,
    validate: {
      validator: (value) => indianMobileRegex.test(String(value || '').trim()),
      message: 'Mobile number must be a valid 10-digit Indian number starting with 6, 7, 8, or 9',
    },
  },
  pincode: { type: String, required: true },
  locality: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  landmark: { type: String },
  alternatePhone: {
    type: String,
    validate: {
      validator: (value) => !value || indianMobileRegex.test(String(value).trim()),
      message: 'Alternate phone must be a valid 10-digit Indian number starting with 6, 7, 8, or 9',
    },
  },
  addressType: { type: String, enum: ['Home', 'Work'], default: 'Home' },
  createdAt: { type: Date, default: Date.now }
});

export const Address = mongoose.model('Address', addressSchema);
