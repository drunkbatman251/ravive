import { Router } from 'express';
import { addWorkout, listExercises } from '../controllers/exerciseController.js';

const router = Router();
router.get('/', listExercises);
router.post('/workouts', addWorkout);

export default router;
