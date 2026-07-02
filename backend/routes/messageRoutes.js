const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { allMessages, sendMessage } = require('../controllers/messageController');

router.get('/:chatId', protect, allMessages);
router.post('/', protect, sendMessage);

module.exports = router;
