import { Router } from 'express';
import { evaluateAndList } from '../controllers/achievementController.js';

const router = Router();
router.get('/', evaluateAndList);

export default router;
