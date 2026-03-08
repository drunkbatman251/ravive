import { Router } from 'express';
import { completeSatabdiDay, getSatabdiDay, getSatabdiProgram } from '../controllers/programController.js';

const router = Router();

router.get('/satabdi', getSatabdiProgram);
router.get('/satabdi/day/:day', getSatabdiDay);
router.post('/satabdi/day/:day/complete', completeSatabdiDay);

export default router;
