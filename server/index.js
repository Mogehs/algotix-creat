import express from "express";
import { Server } from "socket.io";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import Message from "./models/Message.js";
import messageRoutes from "./routes/messages.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/messages", messageRoutes);

io.on("connection", (socket) => {
  // console.log("A user connected");

  socket.on("chatMessage", async (msg) => {
    // console.log("Received message:", msg);

    try {
      const message = new Message(msg);
      await message.save();
      // console.log("Message saved to MongoDB");

      fs.readFile("messages.json", "utf8", (err, data) => {
        if (err) {
          console.error("Error reading messages.json:", err);
          return;
        }

        const json = data ? JSON.parse(data) : [];
        json.push(msg);

        fs.writeFile("messages.json", JSON.stringify(json, null, 2), (err) => {
          if (err) {
            console.error("Error writing to messages.json:", err);
          } else {
            // console.log("Message appended to messages.json");
          }
        });
      });

      io.emit("chatMessage", msg);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
