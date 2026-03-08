import { Router } from 'express';
import { getCoachAdvice } from '../controllers/aiController.js';

const router = Router();
router.get('/coach', getCoachAdvice);

export default router;
