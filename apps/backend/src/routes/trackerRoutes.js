import { Router } from 'express';
import { addHabit, addMood, addNegativeEvent, addReading, addSleep } from '../controllers/trackerController.js';

const router = Router();
router.post('/habits', addHabit);
router.post('/mood', addMood);
router.post('/reading', addReading);
router.post('/sleep', addSleep);
router.post('/negative', addNegativeEvent);

export default router;
