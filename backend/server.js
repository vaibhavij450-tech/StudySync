
const dns = require("node:dns");

// Fix SRV DNS lookup using Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Task Schema
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ["High", "Medium", "Low"],
    },
    done: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "StudySync backend is running!",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// Get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("Fetch tasks error:", error.message);
    res.status(500).json({ message: "Failed to fetch tasks." });
  }
});

// Create a task
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, subject, time, duration, priority } = req.body;

    if (!title || !subject || !time || !duration || !priority) {
      return res.status(400).json({
        message: "Please provide all task details.",
      });
    }

    const task = await Task.create({
      title,
      subject,
      time,
      duration,
      priority,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error.message);
    res.status(400).json({
      message: "Failed to create task.",
    });
  }
});

// Update task completion
app.patch("/api/tasks/:id", async (req, res) => {
  try {
    if (typeof req.body.done !== "boolean") {
      return res.status(400).json({
        message: "Provide done as true or false.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid task ID.",
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { done: req.body.done },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error.message);
    res.status(500).json({
      message: "Failed to update task.",
    });
  }
});

// Connect to MongoDB, then start the server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from the .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(
        `StudySync backend running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
