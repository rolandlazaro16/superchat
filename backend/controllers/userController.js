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

const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const blockId = req.params.id;
    if (user.blockedUsers.includes(blockId)) {
      user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== blockId);
    } else {
      user.blockedUsers.push(blockId);
    }
    await user.save();
    res.status(200).json(user.blockedUsers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { allUsers, toggleBlockUser };
