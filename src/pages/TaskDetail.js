import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTasks } from "../context/TaskContext";
import ThemeToggle from "../components/ThemeToggle";
import "./TaskDetail.css";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allTasks, updateTask, deleteTask } = useTasks();
  const task = allTasks.find((t) => t.id === id || t._id === id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      const d = task.dueDate;
      if (d) {
        if (typeof d === "string") setDueDate(d.slice(0, 10));
        else if (d?.seconds) setDueDate(new Date(d.seconds * 1000).toISOString().slice(0, 10));
        else setDueDate(new Date(d).toISOString().slice(0, 10));
      } else setDueDate("");
    }
  }, [task]);

  if (!task) {
    return (
      <div className="task-detail-page">
        <div className="task-detail-card">
          <div className="task-detail-header">
            <Link to="/" className="back-link">← Back to Tasks</Link>
            <ThemeToggle />
          </div>
          <p>Task not found.</p>
        </div>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateTask(id, {
        title: title.trim() || "(No title)",
        description: description.trim(),
        dueDate: dueDate || null,
      });
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    await deleteTask(task.id || task._id);
    navigate("/", { replace: true });
  };

  return (
    <div className="task-detail-page">
      <div className="task-detail-card">
        <div className="task-detail-header">
          <Link to="/" className="back-link">← Back to Tasks</Link>
          <ThemeToggle />
        </div>

        <form onSubmit={handleSave}>
          <label>
            Title
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
            Due date (optional)
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={saving}
            />
          </label>
          <div className="task-detail-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="delete-btn"
              onClick={handleDelete}
              disabled={saving}
            >
              Delete task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
