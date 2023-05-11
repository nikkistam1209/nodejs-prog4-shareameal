const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// UC-201 create new user
router.post('', userController.createUser);

// UC-202 request all users
router.get('', userController.getAllUsers);

// UC-203 request profile
router.get('/profile', userController.getUserProfile);

// UC-204 request user by id
router.get('/:userId', userController.getUserById);

// UC-205 update user
router.put('/:userId', userController.updateUser);

// UC-206 delete user
router.delete('/:userId', userController.deleteUser);


module.exports = router;