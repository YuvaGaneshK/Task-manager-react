import { openDB } from "idb";

const DB_NAME = "tasks-db";
const DB_VERSION = 1;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("tasks")) {
      db.createObjectStore("tasks", { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains("queue")) {
      db.createObjectStore("queue", { autoIncrement: true });
    }
  },
});

export const saveOfflineTask = async (task) => {
  const db = await dbPromise;
  await db.put("tasks", task);
};

export const getOfflineTasks = async (userId) => {
  const db = await dbPromise;
  const all = await db.getAll("tasks");
  if (!userId) return all;
  return all.filter((t) => t.userId === userId);
};

// Replace all cached tasks with the given list for this user.
// This keeps offline data in sync with the latest server state.
export const setOfflineTasks = async (tasks, userId) => {
  const db = await dbPromise;
  await db.clear("tasks");
  for (const task of tasks || []) {
    const id = task.id || task._id;
    if (!id) continue;
    await db.put("tasks", { ...task, id, userId: task.userId || userId });
  }
};

export const deleteOfflineTask = async (id) => {
  const db = await dbPromise;
  await db.delete("tasks", id);
};

export const addToQueue = async (op) => {
  const db = await dbPromise;
  await db.add("queue", op);
};

export const getQueue = async () => {
  const db = await dbPromise;
  return db.getAll("queue");
};

export const clearQueue = async () => {
  const db = await dbPromise;
  const tx = db.transaction("queue", "readwrite");
  await tx.objectStore("queue").clear();
};
