const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: "",
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  deletedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  hiddenContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  clearedChats: [{ 
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    clearedAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

// Hash password before saving to database
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords for login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
