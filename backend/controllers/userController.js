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

  const query = { ...keyword, _id: { $ne: req.user._id } };
  console.log("Fetching all users with query:", JSON.stringify(query));
  const users = await User.find(query).select("-password");
  console.log("Found users count:", users.length);
  res.send(users);
};

module.exports = { allUsers };
