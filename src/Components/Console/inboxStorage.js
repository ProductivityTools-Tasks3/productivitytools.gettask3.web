export const INBOX_CACHE_STORAGE_KEY = "gt3_cached_inboxes";
export const PENDING_INBOX_TASKS_STORAGE_KEY = "gt3_pending_inbox_tasks";

export function loadCachedInboxes() {
  try {
    const raw = localStorage.getItem(INBOX_CACHE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        item.elementId !== undefined &&
        item.elementId !== null &&
        typeof item.inboxName === "string" &&
        item.inboxName.trim() !== ""
    );
  } catch (err) {
    console.error("Failed to read cached inboxes from localStorage", err);
    return [];
  }
}

export function saveCachedInboxes(inboxItems) {
  try {
    if (!Array.isArray(inboxItems)) return;
    const compact = inboxItems
      .filter(
        (item) =>
          item &&
          item.elementId !== undefined &&
          item.elementId !== null &&
          typeof item.inboxName === "string" &&
          item.inboxName.trim() !== ""
      )
      .map((item) => ({
        elementId: item.elementId,
        inboxName: item.inboxName.trim(),
      }));
    localStorage.setItem(INBOX_CACHE_STORAGE_KEY, JSON.stringify(compact));
  } catch (err) {
    console.error("Failed to save cached inboxes to localStorage", err);
  }
}

export function clearCachedInboxes() {
  try {
    localStorage.removeItem(INBOX_CACHE_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear cached inboxes from localStorage", err);
  }
}

export function loadPendingInboxTasks() {
  try {
    const raw = localStorage.getItem(PENDING_INBOX_TASKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read pending inbox tasks from localStorage", err);
    return [];
  }
}

export function savePendingInboxTasks(tasks) {
  try {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      localStorage.removeItem(PENDING_INBOX_TASKS_STORAGE_KEY);
    } else {
      localStorage.setItem(PENDING_INBOX_TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }
  } catch (err) {
    console.error("Failed to save pending inbox tasks to localStorage", err);
  }
}
