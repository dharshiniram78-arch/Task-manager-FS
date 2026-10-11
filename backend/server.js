const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

function formatTask(row) {
  return {
    id: row.id,
    name: row.title,
    title: row.title,
    completed: row.completed,
    created_at: row.created_at,
  };
}

app.get("/api/health", (req, res) => {
  res.json({
    message: "Task Manager API is running",
  });
});

app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, completed, created_at FROM tasks ORDER BY id DESC"
    );

    res.status(200).json(result.rows.map(formatTask));
  } catch (error) {
    console.error("GET /api/tasks failed:", error.message);
    res.status(500).json({
      message: "Could not load tasks",
    });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const title = (req.body?.title || req.body?.name || "").trim();

    if (!title) {
      return res.status(400).json({
        message: "Task name is required",
      });
    }

    const result = await pool.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, completed, created_at",
      [title]
    );

    const createdTask = formatTask(result.rows[0]);
    console.log("Created task:", createdTask.id);

    res.status(201).json(createdTask);
  } catch (error) {
    console.error("POST /api/tasks failed:", error.message);
    res.status(500).json({
      message: "Could not create task",
    });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId)) {
      return res.status(400).json({
        message: "Invalid task id",
      });
    }

    if (typeof req.body?.completed !== "boolean") {
      return res.status(400).json({
        message: "completed must be true or false",
      });
    }

    const result = await pool.query(
      "UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING id, title, completed, created_at",
      [req.body.completed, taskId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const updatedTask = formatTask(result.rows[0]);
    console.log("Updated task:", updatedTask.id);

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("PUT /api/tasks/:id failed:", error.message);
    res.status(500).json({
      message: "Could not update task",
    });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId)) {
      return res.status(400).json({
        message: "Invalid task id",
      });
    }

    const result = await pool.query("DELETE FROM tasks WHERE id = $1", [taskId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    console.log("Deleted task:", taskId);

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/tasks/:id failed:", error.message);
    res.status(500).json({
      message: "Could not delete task",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
