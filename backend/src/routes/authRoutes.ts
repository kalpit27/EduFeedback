import { Router } from 'express';
import { login, register, getMe, updateProfile } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticateJWT, getMe);
router.put('/profile', authenticateJWT, updateProfile);

export default router;
