const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { allMessages, sendMessage, deleteMessage } = require('../controllers/messageController');

router.get('/:chatId', protect, allMessages);
router.post('/', protect, sendMessage);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
