import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  fetchTasks,
  getTasksForUser,
  syncOfflineQueue,
  updateTask as updateTaskApi,
} from "../Services/taskService";

const TaskContext = createContext(null);

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
};

export function TaskProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const uid = user?.uid;

  const loadTasks = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const data = await getTasksForUser(uid);
      setTasks(data || []);
    } catch (err) {
      console.error(err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setTasks([]);
      setLoading(false);
      return;
    }
    loadTasks();
  }, [uid, loadTasks]);

  useEffect(() => {
    if (!uid) return;
    const handleOnline = () => {
      setSyncing(true);
      syncOfflineQueue(uid)
        .then(() => loadTasks())
        .finally(() => setSyncing(false));
    };
    if (navigator.onLine) handleOnline();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [uid, loadTasks]);

  const createTask = useCallback(
    async (task) => {
      if (!uid) throw new Error("Not authenticated");
      const created = await createTaskApi(uid, task);
      setTasks((prev) => [created, ...prev]);
      return created;
    },
    [uid]
  );

  const updateTask = useCallback(
    async (id, updates) => {
      if (!uid) throw new Error("Not authenticated");
      const updated = await updateTaskApi(uid, id, updates);
      setTasks((prev) =>
        prev.map((t) => (t.id === id || t._id === id ? { ...t, ...updated } : t))
      );
      return updated;
    },
    [uid]
  );

  const deleteTask = useCallback(
    async (id) => {
      if (!uid) throw new Error("Not authenticated");
      await deleteTaskApi(uid, id);
      setTasks((prev) => prev.filter((t) => t.id !== id && t._id !== id));
    },
    [uid]
  );

  const toggleComplete = useCallback(
    async (id) => {
      const task = tasks.find((t) => t.id === id || t._id === id);
      if (!task) return;
      await updateTask(id, { completed: !task.completed });
    },
    [tasks, updateTask]
  );

  const filteredTasks =
    filter === "active"
      ? tasks.filter((t) => !t.completed)
      : filter === "completed"
      ? tasks.filter((t) => t.completed)
      : tasks;

  const value = {
    tasks: filteredTasks,
    allTasks: tasks,
    loading,
    syncing,
    filter,
    setFilter,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    refreshTasks: loadTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
