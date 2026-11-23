export const INBOX_CACHE_STORAGE_KEY = "gt3_cached_inboxes";
export const PENDING_INBOX_TASKS_STORAGE_KEY = "gt3_pending_inbox_tasks";
export const LAST_USED_INBOX_STORAGE_KEY = "gt3_last_used_inbox";

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

export function loadLastUsedInboxId() {
  try {
    return localStorage.getItem(LAST_USED_INBOX_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to read last used inbox from localStorage", err);
    return null;
  }
}

export function saveLastUsedInboxId(elementId) {
  try {
    if (elementId === undefined || elementId === null) return;
    localStorage.setItem(LAST_USED_INBOX_STORAGE_KEY, String(elementId));
  } catch (err) {
    console.error("Failed to save last used inbox to localStorage", err);
  }
}

export function clearLastUsedInboxId() {
  try {
    localStorage.removeItem(LAST_USED_INBOX_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear last used inbox from localStorage", err);
  }
}

export function resolveQuickAddInbox(inboxItems, requestedTarget, lastUsedInboxId) {
  if (!Array.isArray(inboxItems) || inboxItems.length === 0) {
    return null;
  }

  if (typeof requestedTarget === "string" && requestedTarget.trim() !== "") {
    const trimmed = requestedTarget.trim();
    const lower = trimmed.toLowerCase();
    const byNameOrId = inboxItems.find(
      (item) =>
        item.inboxName?.trim().toLowerCase() === lower ||
        String(item.elementId) === trimmed
    );
    if (byNameOrId) {
      return byNameOrId;
    }
  }

  if (lastUsedInboxId !== undefined && lastUsedInboxId !== null && lastUsedInboxId !== "") {
    const byLastUsed = inboxItems.find(
      (item) => String(item.elementId) === String(lastUsedInboxId)
    );
    if (byLastUsed) {
      return byLastUsed;
    }
  }

  return inboxItems[0];
}

