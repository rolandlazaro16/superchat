const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { accessChat, fetchChats, createGroupChat } = require('../controllers/chatController');

router.post('/', protect, accessChat);
router.get('/', protect, fetchChats);
router.post('/group', protect, createGroupChat);

module.exports = router;
