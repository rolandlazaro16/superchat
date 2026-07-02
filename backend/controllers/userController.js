const User = require('../models/User');

// @desc    Get or Search all users
// @route   GET /api/user?search=
// @access  Protected
const allUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }).select("-password");
  res.send(users);
};

module.exports = { allUsers };
