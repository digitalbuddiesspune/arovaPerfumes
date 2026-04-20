import { Router } from 'express';
import { getLogo, getHeroSlider, getHomeBanners } from '../controllers/admin.controller.js';

const router = Router();

// Public endpoint to get logo settings (no auth required)
router.get('/logo', getLogo);

// Public endpoint to get hero slider settings (no auth required)
router.get('/hero-slider', getHeroSlider);

// Public endpoint to get homepage desktop/mobile banners (no auth required)
router.get('/home-banners', getHomeBanners);

export default router;

