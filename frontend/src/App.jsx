import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        setError("");
 
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to load tasks");
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError("Could not load tasks. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  async function handleAddTask(event) {
    event.preventDefault();

    const taskName = newTask.trim();
    if (taskName === "") {
      return;
    }

    try {
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: taskName }),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      const createdTask = await response.json();
      setTasks([...tasks, createdTask]);
      setNewTask("");
    } catch (err) {
      setError("Could not add the task. Please try again.");
    }
  }

  async function handleToggleComplete(taskId) {
    const currentTask = tasks.find((task) => task.id === taskId);

    if (!currentTask) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !currentTask.completed }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();

      const updatedTasks = tasks.map((task) => {
        if (task.id === updatedTask.id) {
          return updatedTask;
        }
        return task;
      });

      setTasks(updatedTasks);
    } catch (err) {
      setError("Could not update the task. Please try again.");
    }
  }

  async function handleDeleteTask(taskId) {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      const remainingTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(remainingTasks);
    } catch (err) {
      setError("Could not delete the task. Please try again.");
    }
  }

  const visibleTasks = tasks.filter((task) => {
    if (filter === "active") {
      return !task.completed;
    }
    if (filter === "completed") {
      return task.completed;
    }
    return true;
  });

  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <div className="page">
      <main className="card">
        <header className="header">
          <p className="eyebrow">Stay organized</p>
          <h1>Task Manager</h1>
          <p className="subtitle">
            Add tasks, mark them complete, and filter your list.
          </p>
        </header>

        <form className="add-form" onSubmit={handleAddTask}>
          <label className="sr-only" htmlFor="task-input">
            Task name
          </label>
          <input
            id="task-input"
            type="text"
            placeholder="Enter a task"
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
          />
          <button type="submit">Add Task</button>
        </form>

        {error ? <p className="status error">{error}</p> : null}

        <div className="toolbar">
          <p className="count">
            {activeCount} active · {completedCount} completed
          </p>
          <div className="filters" role="tablist" aria-label="Task filters">
            <button
              type="button"
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={filter === "active" ? "active" : ""}
              onClick={() => setFilter("active")}
            >
              Active
            </button>
            <button
              type="button"
              className={filter === "completed" ? "active" : ""}
              onClick={() => setFilter("completed")}
            >
              Completed
            </button>
          </div>
        </div>

        {loading ? (
          <p className="empty">Loading tasks...</p>
        ) : visibleTasks.length === 0 ? (
          <p className="empty">No tasks to show for this filter.</p>
        ) : (
          <ul className="task-list">
            {visibleTasks.map((task) => (
              <li key={task.id} className={task.completed ? "completed" : ""}>
                <label className="task-item">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id)}
                  />
                  <span>{task.name}</span>
                </label>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default App;
