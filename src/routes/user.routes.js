const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

// UC-201 create new user
router.post('', userController.createUser);

// UC-202 request all users
router.get('', authController.validateToken, userController.getAllUsers);

// UC-203 request profile
router.get('/profile', authController.validateToken, userController.getUserProfile);

// UC-204 request user by id
router.get('/:userId', authController.validateToken, userController.getUserById);

// UC-205 update user
router.put('/:userId', authController.validateToken, userController.updateUser);

// UC-206 delete user
router.delete('/:userId', authController.validateToken, userController.deleteUser);


module.exports = router;