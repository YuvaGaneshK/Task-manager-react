import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTasks } from "../context/TaskContext";
import ThemeToggle from "../components/ThemeToggle";
import "./TaskDetail.css";

export default function AddTask() {
  const navigate = useNavigate();
  const { createTask } = useTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        completed: false,
        dueDate: dueDate || null,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="task-detail-page">
      <div className="task-detail-card">
        <div className="task-detail-header">
          <Link to="/" className="back-link">← Back to Tasks</Link>
          <ThemeToggle />
        </div>
        <h2>Add new task</h2>

        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <label>
            Title *
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              disabled={saving}
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description…"
              rows={4}
              disabled={saving}
            />
          </label>
          <label>
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={saving}
            />
          </label>
          <div className="task-detail-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create task"}
            </button>
            <Link to="/" className="cancel-link">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
