const express = require('express');
const { allUsers, toggleBlockUser, toggleHideContact, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/').get(protect, allUsers);
router.route('/profile').put(protect, updateUserProfile);
router.route('/:id/block').put(protect, toggleBlockUser);
router.route('/:id/hide').put(protect, toggleHideContact);

module.exports = router;
