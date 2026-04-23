import { Router } from 'express';
import { googleCallback, redirectToGoogle } from '../controllers/authController.js';

const router = Router();

router.get('/google', redirectToGoogle);
router.get('/google/callback', googleCallback);

export default router;
