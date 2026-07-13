const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { accessChat, fetchChats, createGroupChat, deleteChatForUser, clearChatForUser } = require('../controllers/chatController');

router.post('/', protect, accessChat);
router.get('/', protect, fetchChats);
router.post('/group', protect, createGroupChat);

router.put('/:id/delete', protect, deleteChatForUser);
router.put('/:id/clear', protect, clearChatForUser);

module.exports = router;
