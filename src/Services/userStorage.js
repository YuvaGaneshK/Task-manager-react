const STORAGE_KEY = "task-manager-user";

export function saveUserDetails(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
    })
  );
}

export function getUserDetails() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearUserDetails() {
  localStorage.removeItem(STORAGE_KEY);
}
