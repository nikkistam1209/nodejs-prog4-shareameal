const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const authController = require('../controllers/auth.controller');

// UC-301 create new meal
router.post('', authController.validateToken, mealController.createMeal);

// UC-302 update meal
router.put('/:mealId', authController.validateToken, mealController.updateMeal);

// UC-303 request all meals
router.get('', mealController.getAllMeals);

// UC-304 request meal by id
router.get('/:mealId', mealController.getMealById);

// UC-305 delete meal
router.delete('/:mealId', authController.validateToken, mealController.deleteMeal);


module.exports = router;