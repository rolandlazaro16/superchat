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

  const query = { ...keyword, _id: { $ne: req.user._id, $nin: req.user.hiddenContacts || [] } };
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

const toggleHideContact = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const targetId = req.params.id;
    if (user.hiddenContacts.includes(targetId)) {
      user.hiddenContacts = user.hiddenContacts.filter(id => id.toString() !== targetId);
    } else {
      user.hiddenContacts.push(targetId);
    }
    await user.save();
    res.status(200).json(user.hiddenContacts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.profilePic = req.body.profilePic || user.profilePic;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        profilePic: updatedUser.profilePic,
        token: req.headers.authorization.split(" ")[1],
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { allUsers, toggleBlockUser, toggleHideContact, updateUserProfile };
