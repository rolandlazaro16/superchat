const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');

// @desc    Get all Messages
// @route   GET /api/message/:chatId
// @access  Protected
const allMessages = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const chatId = req.params.chatId;
    
    // Check if the chat was cleared by this user
    const clearedChat = user.clearedChats?.find(c => c.chatId.toString() === chatId);
    const query = { chat: chatId, deletedBy: { $ne: req.user._id } };
    
    if (clearedChat) {
      query.createdAt = { $gt: clearedChat.clearedAt };
    }

    const messages = await Message.find(query)
      .populate("sender", "name profilePic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create New Message
// @route   POST /api/message
// @access  Protected
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name profilePic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name profilePic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete Message (For me or For everyone)
// @route   DELETE /api/message/:id
// @access  Protected
const deleteMessage = async (req, res) => {
  try {
    const { type } = req.body; // 'for_me' or 'for_everyone'
    const messageId = req.params.id;

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (type === 'for_me') {
      // Add user to deletedBy array if not already there
      if (!message.deletedBy.includes(req.user._id)) {
        message.deletedBy.push(req.user._id);
        await message.save();
      }
      return res.json({ success: true, message: "Deleted for you" });
    } else if (type === 'for_everyone') {
      // Check if user is the sender
      if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can only delete your own messages for everyone" });
      }
      
      // Physically delete the document
      await Message.findByIdAndDelete(messageId);
      
      // Optionally update Chat latestMessage if this was the latest message
      const chat = await Chat.findById(message.chat);
      if (chat && chat.latestMessage && chat.latestMessage.toString() === messageId.toString()) {
        // Find previous latest message
        const prevMessage = await Message.findOne({ chat: chat._id }).sort({ createdAt: -1 });
        chat.latestMessage = prevMessage ? prevMessage._id : null;
        await chat.save();
      }
      
      return res.json({ success: true, message: "Deleted for everyone" });
    } else {
      return res.status(400).json({ message: "Invalid delete type" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { allMessages, sendMessage, deleteMessage };
