import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import ThemeToggle from "../components/ThemeToggle";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  console.log(user);
  const {
    tasks,
    loading,
    filter,
    setFilter,
    toggleComplete,
    deleteTask,
    syncing,
  } = useTasks();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-row">
          <h1>Tasks</h1>
          <div className="header-actions">
            <ThemeToggle />
            {!navigator.onLine && (
              <span className="offline-badge">Offline</span>
            )}
            {syncing && <span className="syncing-badge">Syncing…</span>}
            <span className="user-email">{user?.displayName}</span>
            <button type="button" className="logout-btn" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="filters">
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

        <Link to="/task/new" className="add-task-btn my-5">
          + Add new task
        </Link>

        {loading ? (
          <p className="loading-msg">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <p className="empty-msg">No tasks yet. Add one to get started.</p>
        ) : (
          <ul className="task-list my-5">
            {tasks.map((task) => (
              <li
                key={task.id || task._id}
                className={`task-item ${task.completed ? "completed" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={!!task.completed}
                  onChange={() => toggleComplete(task.id || task._id)}
                  aria-label={`Mark ${task.title} as ${
                    task.completed ? "incomplete" : "complete"
                  }`}
                />
                <div className="task-content">
                  <span className="task-title">
                    {task.title || "(No title)"}
                  </span>
                  {task.description && (
                    <span className="task-desc-preview">
                      {task.description}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="task-due">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="task-actions">
                  <Link
                    to={`/task/${task.id || task._id}`}
                    className="edit-btn"
                    aria-label="Edit task"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => deleteTask(task.id || task._id)}
                    aria-label="Delete task"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
