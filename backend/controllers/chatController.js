const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Create or fetch One to One Chat
// @route   POST /api/chat
// @access  Protected
const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "UserId param not sent with request" });
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name profilePic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

// @desc    Fetch all chats for a user
// @route   GET /api/chat
// @access  Protected
const fetchChats = async (req, res) => {
  try {
    Chat.find({ 
      users: { $elemMatch: { $eq: req.user._id } },
      _id: { $nin: req.user.deletedChats || [] }
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name profilePic email",
        });

        // Hide latest message if it was deleted by the user
        const finalResults = results.map(chat => {
          if (chat.latestMessage && chat.latestMessage.deletedBy && chat.latestMessage.deletedBy.includes(req.user._id)) {
            // Set content to indicate it's deleted
            chat.latestMessage.content = "🚫 Message deleted";
          }
          return chat;
        });

        res.status(200).send(finalResults);
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create New Group Chat
// @route   POST /api/chat/group
// @access  Protected
const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send({ message: "More than 2 users are required to form a group chat" });
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Toggle Pin Chat
// @route   PUT /api/chat/:id/pin
// @access  Protected
const togglePinChat = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const chatId = req.params.id;
    if (user.pinnedChats.some(id => id.toString() === chatId)) {
      user.pinnedChats = user.pinnedChats.filter(id => id.toString() !== chatId);
    } else {
      user.pinnedChats.push(chatId);
    }
    user.markModified('pinnedChats');
    await user.save();
    res.status(200).json(user.pinnedChats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete Chat (hide for user)
// @route   PUT /api/chat/:id/delete
// @access  Protected
const deleteChatForUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const chatId = req.params.id;
    if (!user.deletedChats.includes(chatId)) {
      user.deletedChats.push(chatId);
      await user.save();
    }
    res.status(200).json(user.deletedChats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Clear Chat
// @route   PUT /api/chat/:id/clear
// @access  Protected
const clearChatForUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const chatId = req.params.id;
    const existingClear = user.clearedChats.find(c => c.chatId.toString() === chatId);
    if (existingClear) {
      existingClear.clearedAt = Date.now();
    } else {
      user.clearedChats.push({ chatId, clearedAt: Date.now() });
    }
    await user.save();
    res.status(200).json(user.clearedChats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  togglePinChat,
  deleteChatForUser,
  clearChatForUser,
};
