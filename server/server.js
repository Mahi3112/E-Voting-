import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import passport from "./auth.js";
import databaseConnection from "./db.js";
import UserRoute from "./Routes/UserRoute.js";
import adminRoutes from './Routes/AdminRoute.js';
import electionRoutes from './Routes/ElectionRoute.js';
import http from "http";
import { Server } from "socket.io";

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();
app.use('/uploads', express.static('uploads'))
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*", // safer to control from env
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Connect to MongoDB
databaseConnection();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Passport auth setup
app.use(passport.initialize());

// Routes
app.use("/user", UserRoute);
app.use("/admin", adminRoutes);
app.use("/election", electionRoutes(io));

// WebSocket Events
io.on("connection", (socket) => {
  console.log(`🟢 Client connected: ${socket.id}`);

  socket.on("joinElectionRoom", (electionId) => {
    socket.join(electionId);
    console.log(`🔔 Socket ${socket.id} joined room ${electionId}`);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


