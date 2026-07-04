const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Huruhusu domains zote (pamoja na Vercel na localhost)
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Routes setup
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.send('Superchat Backend is running');
});

// Socket.io connection setup
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('setup', (userData) => {
    if (userData && userData._id) {
      const roomId = userData._id.toString();
      socket.join(roomId);
      console.log('User Joined Room:', roomId);
      socket.emit('connected');
    }
  });

  socket.on('join chat', (room) => {
    socket.join(room.toString());
    console.log('User Joined Chat Room: ' + room);
  });

  socket.on('new message', (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat || !chat.users) return console.log('chat.users not defined');

    chat.users.forEach((user) => {
      const userId = user._id ? user._id.toString() : user.toString();
      const senderId = newMessageRecieved.sender._id ? newMessageRecieved.sender._id.toString() : newMessageRecieved.sender.toString();
      
      if (userId === senderId) return;
      
      console.log(`Emitting message from ${senderId} to room ${userId}`);
      socket.in(userId).emit('message received', newMessageRecieved);
    });
  });

  socket.on('message deleted', (deletedMessage) => {
    var chat = deletedMessage.chat;
    if (!chat || !chat.users) return console.log('chat.users not defined');

    chat.users.forEach((user) => {
      const userId = user._id ? user._id.toString() : user.toString();
      const senderId = deletedMessage.sender._id ? deletedMessage.sender._id.toString() : deletedMessage.sender.toString();
      
      if (userId === senderId) return;
      
      console.log(`Emitting message deleted to room ${userId}`);
      socket.in(userId).emit('message deleted', deletedMessage);
    });
  });

  // WebRTC Signaling
  socket.on('call user', (data) => {
    // data: { userToCall, signalData, from, callerInfo }
    io.to(data.userToCall).emit('incoming call', {
      signal: data.signalData,
      from: data.from,
      callerInfo: data.callerInfo
    });
  });

  socket.on('answer call', (data) => {
    // data: { to, signal }
    io.to(data.to).emit('call accepted', data.signal);
  });
  
  socket.on('ice-candidate', (data) => {
    // data: { to, candidate }
    io.to(data.to).emit('ice-candidate', data.candidate);
  });

  socket.on('end call', (data) => {
    // data: { to }
    io.to(data.to).emit('call ended');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/superchat';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
