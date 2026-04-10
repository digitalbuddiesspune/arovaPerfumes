import express from 'express';
import { getPricingSettings, updatePricingSettings } from '../controllers/pricingSettings.controller.js';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/admin.js';

const router = express.Router();

// GET /api/settings/pricing - Get pricing settings (Public)
router.get('/', getPricingSettings);

// PUT /api/settings/pricing - Update pricing settings (Admin only)
router.put('/', auth, adminOnly, updatePricingSettings);

export default router;
