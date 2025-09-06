
import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import patientRouter from "./routes/patientRoutes.js";
import donorRouter from "./routes/donorRoutes.js";


const app = express();
const server = createServer(app);
const port = process.env.PORT || 4000;
connectDB();

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  allowEIO3: true
});

const allowedOrigins = ['http://localhost:5173']

// Parse incoming JSON requests and put the parsed data in req.body
app.use(express.json());
// Parse cookies attached to the client request object (req.cookies)
app.use(cookieParser());
// Enable CORS and allow credentials (cookies, authorization headers, etc.) to be sent in cross-origin requests
app.use(
  cors({ 
    origin: allowedOrigins,
    // Allow requests from this origin
    credentials: true, // Allow cookies and auth headers in requests
  })
);

// API Endpoints
app.get("/", (req, res) => {
    res.send("API Working");
});
// Use the authRouter for all auth-related routes
// All routes defined in authRouter will now be prefixed with /api/auth
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/patient", patientRouter);
app.use("/api/donor", donorRouter);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);
  console.log('Socket transport:', socket.conn.transport.name);

  // Join a room for a specific conversation
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`✅ User ${socket.id} joined room ${roomId}`);
    // Send confirmation back to client
    socket.emit('room-joined', { roomId, success: true });
  });

  // Handle sending messages
  socket.on('send-message', (data) => {
    console.log('📨 Received message:', data);
    const { roomId, message, senderId, senderName, senderRole } = data;
    
    const messageData = {
      message,
      senderId,
      senderName,
      senderRole,
      timestamp: new Date()
    };
    
    io.to(roomId).emit('receive-message', messageData);
    console.log(`📤 Message sent to room ${roomId}:`, messageData);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { roomId, isTyping, userName } = data;
    socket.to(roomId).emit('user-typing', { isTyping, userName });
    console.log(`⌨️ Typing indicator: ${userName} is ${isTyping ? 'typing' : 'not typing'} in room ${roomId}`);
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log('❌ User disconnected:', socket.id, 'Reason:', reason);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

server.listen(port, () => {
    console.log(`Server started on PORT : ${port}`);
});
