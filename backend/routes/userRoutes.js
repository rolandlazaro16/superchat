const express = require('express');
const { allUsers } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/').get(protect, allUsers);

module.exports = router;
