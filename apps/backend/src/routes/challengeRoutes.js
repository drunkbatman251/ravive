import { Router } from 'express';
import { completeDailyMiniChallenge, getDailyMiniChallenge } from '../controllers/challengeController.js';

const router = Router();

router.get('/daily', getDailyMiniChallenge);
router.post('/daily/complete', completeDailyMiniChallenge);

export default router;
