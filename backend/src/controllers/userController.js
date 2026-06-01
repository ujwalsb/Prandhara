const User = require('../models/User');
const { paginate } = require('../utils/helpers');

// @desc    Get all users (admin)
// @route   GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { pageNum, limitNum, skip } = paginate(page, limit);

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limitNum).select('-refreshToken'),
      User.countDocuments(),
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (admin)
// @route   PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isVerified } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isVerified !== undefined) user.isVerified = isVerified;

    await user.save();

    res.json({
      message: 'User updated.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
