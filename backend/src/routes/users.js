const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const userController = require('../controllers/userController');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate, authorize('admin', 'superadmin'));

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);

router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
  ],
  validate,
  userController.updateUser
);

router.delete('/:id', userController.deleteUser);

module.exports = router;
