const express = require('express');
const { allUsers, toggleBlockUser } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/').get(protect, allUsers);
router.route('/:id/block').put(protect, toggleBlockUser);

module.exports = router;
