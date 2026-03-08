import { Router } from 'express';
import { addMeal, dailyNutrition, listFoodItems, recentMeals } from '../controllers/nutritionController.js';

const router = Router();
router.get('/foods', listFoodItems);
router.get('/recent', recentMeals);
router.post('/meals', addMeal);
router.get('/daily', dailyNutrition);

export default router;
