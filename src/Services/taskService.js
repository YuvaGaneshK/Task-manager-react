import {
    addToQueue,
    clearQueue,
    deleteOfflineTask,
    getOfflineTasks,
    getQueue,
    saveOfflineTask,
    setOfflineTasks,
  } from "./offlineDB";
  import { api } from "./api";
  
  function toTask(item) {
    const id = item.id || item._id;
    return {
      id,
      _id: id,
      userId: item.userId,
      title: item.title || "",
      description: item.description || "",
      completed: item.completed ?? false,
      dueDate: item.dueDate || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
  
  export async function fetchTasks(uid) {
    const data = await api("/api/tasks", "GET", null, uid);
    return Array.isArray(data) ? data.map(toTask) : [];
  }
  
  export async function createTask(uid, task) {
    const payload = {
      title: task.title || "",
      description: task.description || "",
      completed: task.completed ?? false,
      dueDate: task.dueDate || null,
    };
  
    if (navigator.onLine) {
      // Online: create directly on the API (MongoDB).
      const created = await api("/api/tasks", "POST", payload, uid);
      return toTask(created);
    } else {
      const id = `offline_${Date.now()}`;
      const offlineTask = {
        id,
        _id: id,
        userId: uid,
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveOfflineTask(offlineTask);
      await addToQueue({ op: "create", task: offlineTask, uid });
      return offlineTask;
    }
  }
  
  export async function updateTask(uid, id, updates) {
    const payload = { ...updates };
  
    if (navigator.onLine) {
      const updated = await api(`/api/tasks/${id}`, "PUT", payload, uid);
      return toTask(updated);
    } else {
      const local = await getOfflineTasks(uid);
      const existing = local.find((t) => t.id === id || t._id === id);
      if (existing) {
        const merged = {
          ...existing,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await saveOfflineTask(merged);
        await addToQueue({ op: "update", task: merged, uid });
        return merged;
      }
      throw new Error("Task not found");
    }
  }
  
  export async function deleteTask(uid, id) {
    if (navigator.onLine) {
      await api(`/api/tasks/${id}`, "DELETE", null, uid);
    } else {
      await deleteOfflineTask(id);
      await addToQueue({ op: "delete", id, uid });
    }
  }
  
  export async function syncOfflineQueue(uid) {
    const queue = await getQueue();
    const remaining = [];
    for (const item of queue) {
      if (item.uid !== uid) {
        remaining.push(item);
        continue;
      }
      try {
        if (item.op === "create") {
          const { id, _id, ...rest } = item.task;
          await api("/api/tasks", "POST", rest, uid);
        } else if (item.op === "update") {
          const docId = item.task.id?.startsWith("offline_")
            ? null
            : item.task.id;
          if (docId) {
            const { id, _id, userId, createdAt, ...updates } = item.task;
            await api(`/api/tasks/${docId}`, "PUT", updates, uid);
          }
        } else if (item.op === "delete" && !item.id?.startsWith("offline_")) {
          await api(`/api/tasks/${item.id}`, "DELETE", null, uid);
        }
      } catch (e) {
        console.error("Sync error for", item, e);
        remaining.push(item);
      }
    }
    await clearQueue();
    for (const item of remaining) {
      await addToQueue(item);
    }
  }
  
  export async function getTasksForUser(uid) {
    if (navigator.onLine) {
      // When online, fetch from API and update the offline cache
      // so the same data is available when the user goes offline.
      const tasks = await fetchTasks(uid);
      await setOfflineTasks(tasks, uid);
    return tasks;
  }
  // When offline, fall back to the cached copy in IndexedDB, filtered by user.
  return getOfflineTasks(uid);
}
  