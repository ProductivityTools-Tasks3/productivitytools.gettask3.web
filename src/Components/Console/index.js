import React, { useEffect, useState, useRef, useMemo } from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import apiService from "../../services/apiService";
import { signInWithGoogle, logout } from "../../Session/firebase";
import { useAuth } from "../../Session/AuthContext";

import StructureTree from "../StructureTree";
import ItemDetails from "../ItemDetails";
import {
  loadCachedInboxes,
  saveCachedInboxes,
  clearCachedInboxes,
  loadPendingInboxTasks,
  savePendingInboxTasks,
  loadLastUsedInboxId,
  saveLastUsedInboxId,
  clearLastUsedInboxId,
  resolveQuickAddInbox,
} from "./inboxStorage";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function getInboxElements(nodeOrList) {
  if (!nodeOrList) return [];
  let result = [];
  if (Array.isArray(nodeOrList)) {
    for (const item of nodeOrList) {
      result = result.concat(getInboxElements(item));
    }
    return result;
  }
  if (nodeOrList.inboxName && typeof nodeOrList.inboxName === "string" && nodeOrList.inboxName.trim() !== "") {
    result.push(nodeOrList);
  }
  if (nodeOrList.elements && Array.isArray(nodeOrList.elements)) {
    for (const child of nodeOrList.elements) {
      result = result.concat(getInboxElements(child));
    }
  }
  return result;
}

function getPathToElement(root, targetId) {
  if (!root || targetId === null || targetId === undefined) return [];
  const targetIdStr = targetId.toString();

  function findPath(node) {
    if (!node) return null;
    const currentIdStr = node.elementId !== undefined && node.elementId !== null ? node.elementId.toString() : "";
    if (currentIdStr === targetIdStr) {
      return [currentIdStr];
    }
    if (node.elements && Array.isArray(node.elements)) {
      for (const child of node.elements) {
        const subPath = findPath(child);
        if (subPath) {
          return [currentIdStr, ...subPath];
        }
      }
    }
    return null;
  }

  if (Array.isArray(root)) {
    for (const item of root) {
      const p = findPath(item);
      if (p) return p;
    }
    return [];
  }

  return findPath(root) || [];
}

function parseQuickAddFromUrl() {
  if (typeof window === "undefined" || !window.location) return null;
  const params = new URLSearchParams(window.location.search);
  if (!params.has("quickAdd") && !params.has("add")) {
    return null;
  }
  const addVal = params.get("add");
  const quickAddVal = params.get("quickAdd");
  const rawTarget = addVal !== null ? addVal : quickAddVal;
  const isGenericFlag =
    rawTarget === null ||
    rawTarget.trim() === "" ||
    rawTarget.trim() === "1" ||
    rawTarget.trim().toLowerCase() === "true";

  return {
    active: true,
    target: isGenericFlag ? null : rawTarget.trim(),
  };
}

function clearQuickAddParamsFromUrl() {
  if (typeof window === "undefined" || !window.history?.replaceState) return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("quickAdd");
    url.searchParams.delete("add");
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", nextUrl);
  } catch (err) {
    console.error("Failed to clean Quick Add URL params", err);
  }
}

export default function Console() {
  const { user, loading: authLoading } = useAuth();
  const [list, setList] = useState([]);
  const [selectedElement, setSelectedElement] = useState();
  const [newElement, setNewElement] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [showCreatedDate, setShowCreatedDate] = useState(true);
  const [treeVersion, setTreeVersion] = useState(0);
  const [isTreeLoading, setIsTreeLoading] = useState(false);

  const [cachedInboxes, setCachedInboxes] = useState(() => loadCachedInboxes());
  const [lastUsedInboxId, setLastUsedInboxId] = useState(() => loadLastUsedInboxId());
  const [pendingQueueCount, setPendingQueueCount] = useState(() => loadPendingInboxTasks().length);
  const [isSyncingQueue, setIsSyncingQueue] = useState(false);

  const isMountedRef = useRef(true);
  const fetchSeqRef = useRef(0);
  const mutationSeqRef = useRef(0);
  const isFlushingRef = useRef(false);
  const pendingFocusInboxIdRef = useRef(null);
  const lastFetchedUidRef = useRef(undefined);
  const pendingUrlQuickAddRef = useRef(parseQuickAddFromUrl());
  const tasksInputRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [isSticky, setSticky] = useState(false);
  const ref = useRef(null);
  const handleScroll = () => {
    if (ref.current) {
      setSticky(ref.current.getBoundingClientRect().top <= 0);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function findElement(candidateElement, nodeId) {
    if (!candidateElement || candidateElement.elementId === undefined || candidateElement.elementId === null) {
      return null;
    }
    var candidateElementId = candidateElement.elementId.toString();
    if (candidateElementId == nodeId) {
      return candidateElement;
    } else if (Array.isArray(candidateElement.elements)) {
      for (var i = 0; i < candidateElement.elements.length; i += 1) {
        var newCandidateElement = candidateElement.elements[i];
        var result = findElement(newCandidateElement, nodeId);
        if (result != null) {
          return result;
        }
      }
    }
    return null;
  }

  const applyInboxSelection = (treeRoot, targetId) => {
    const se = findElement(treeRoot, targetId);
    if (!se) return false;
    const pathIds = getPathToElement(treeRoot, targetId);
    setExpandedNodes(pathIds);
    console.log("Set selected element", se);
    setSelectedElement(se);
    setMobileView("tree");
    return true;
  };

  const fetchTree = async () => {
    console.log("call apiservice");
    const currentFetchSeq = ++fetchSeqRef.current;
    const mutationAtStart = mutationSeqRef.current;
    if (isMountedRef.current) {
      setIsTreeLoading(true);
    }
    try {
      const r = await apiService.GetTree();
      console.log(r);
      if (!isMountedRef.current || currentFetchSeq !== fetchSeqRef.current) {
        return;
      }
      if (r) {
        setList(r);
        setTreeVersion((v) => v + 1);
        if (pendingFocusInboxIdRef.current !== null) {
          const focusId = pendingFocusInboxIdRef.current;
          pendingFocusInboxIdRef.current = null;
          applyInboxSelection(r, focusId);
        }
        if (mutationSeqRef.current !== mutationAtStart && !isFlushingRef.current) {
          fetchTree();
        }
      }
    } finally {
      if (isMountedRef.current && currentFetchSeq === fetchSeqRef.current) {
        setIsTreeLoading(false);
      }
    }
  };

  const flushPendingInboxTasks = async () => {
    if (isFlushingRef.current) return;
    if (loadPendingInboxTasks().length === 0) return;

    isFlushingRef.current = true;
    if (isMountedRef.current) {
      setIsSyncingQueue(true);
    }

    let anySucceeded = false;
    let lastParentId = null;

    try {
      while (true) {
        const currentQueue = loadPendingInboxTasks();
        if (currentQueue.length === 0) break;

        const nextTask = currentQueue[0];
        try {
          await apiService.addElement(nextTask.parentId, nextTask.name, nextTask.details);
          anySucceeded = true;
          lastParentId = nextTask.parentId;
          mutationSeqRef.current += 1;

          const latestQueue = loadPendingInboxTasks().filter((item) => item.clientId !== nextTask.clientId);
          savePendingInboxTasks(latestQueue);
          if (isMountedRef.current) {
            setPendingQueueCount(latestQueue.length);
          }
        } catch (err) {
          console.error("Error adding queued task to inbox, keeping in queue for retry", err);
          break;
        }
      }
    } finally {
      isFlushingRef.current = false;
      if (isMountedRef.current) {
        setIsSyncingQueue(false);
      }
    }

    if (anySucceeded && isMountedRef.current) {
      if (lastParentId !== null && pendingFocusInboxIdRef.current === null) {
        pendingFocusInboxIdRef.current = lastParentId;
      }
      await fetchTree();
    }
  };

  useEffect(() => {
    if (authLoading) return;
    const uid = user?.uid ?? null;
    if (lastFetchedUidRef.current === uid) return;
    lastFetchedUidRef.current = uid;
    fetchTree();
    if (loadPendingInboxTasks().length > 0) {
      flushPendingInboxTasks();
    }
    console.log("useeffect");
  }, [user, authLoading]);

  useEffect(() => {
    const handleOnline = () => {
      if (loadPendingInboxTasks().length > 0) {
        flushPendingInboxTasks();
      }
    };
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  function updateStatus(elementToUpdate, newStatus) {
    if (!elementToUpdate) return;
    setSelectedElement((prev) => (prev ? { ...prev, status: newStatus } : prev));

    let newList = { ...list };
    let element = findElement(newList, elementToUpdate.elementId);
    if (element) {
      element.status = newStatus;
    }
    setList(newList);
  }

  function updateElementInList(elementToUpdate, propertyName, propertyValue) {
    if (!elementToUpdate) return;
    setSelectedElement((prev) => (prev ? { ...prev, [propertyName]: propertyValue } : prev));
    let newList = { ...list };
    let element = findElement(newList, elementToUpdate.elementId);
    if (element) {
      element[propertyName] = propertyValue;
    }
    setList(newList);
  }

  function isRootElement(element) {
    if (!element) return false;
    return (
      element.type === "User" ||
      element.parentId === null ||
      (list && list.elementId !== undefined && element.elementId === list.elementId)
    );
  }

  function finishItem() {
    finishThisItem(selectedElement);
  }

  function finishItemById(elementId) {
    let element = findElement(list, elementId);
    finishThisItem(element);
  }

  function finishThisItem(elementToUpdate) {
    if (!elementToUpdate || isRootElement(elementToUpdate)) return;
    console.log("Finish.thisitem");
    updateStatus(elementToUpdate, "Finished");
    Promise.resolve(apiService.finish(elementToUpdate.elementId)).finally(() => {
      setTreeVersion((v) => v + 1);
    });
  }

  function unDoneElement() {
    unDoneThisElement(selectedElement);
  }

  function unDoneElementById(elementId) {
    console.log("undone");
    let element = findElement(list, elementId);
    unDoneThisElement(element);
  }

  function unDoneThisElement(elementToUpdate) {
    updateStatus(elementToUpdate, "New");
    Promise.resolve(apiService.unDone(elementToUpdate.elementId)).finally(() => {
      setTreeVersion((v) => v + 1);
    });
  }

  const [mobileView, setMobileView] = useState("tree");

  function nodeSelect(nodeId) {
    var se = findElement(list, nodeId);
    console.log("Set selected element", se);
    setSelectedElement(se);
    setMobileView("details");
  }

  function updateElement(propertyName, propertyValue) {
    console.log("Console update element" + propertyName);
    updateElementInList(selectedElement, propertyName, propertyValue);
  }

  function changeParent(child, newParentId) {
    var childobject = findElement(list, child.elementId);
    var currentparent = findElement(list, child.parentId);
    currentparent.elements = currentparent.elements.filter((item) => item !== childobject);
    var parentobject = findElement(list, newParentId);
    parentobject.elements.push(childobject);
    updateElementInList(child, "parentId", newParentId);
    Promise.resolve(apiService.moveElement(child.elementId, newParentId)).finally(() => {
      setTreeVersion((v) => v + 1);
    });
  }

  function addElement(selectedTreeId) {
    const nowIso = new Date().toISOString();
    let newElement = {
      name: "New element",
      type: 2,
      elementId: null,
      parentId: selectedTreeId,
      status: "New",
      created: nowIso,
      initialization: nowIso,
      started: "0001-01-01T00:00:00",
      finished: null,
      category: null,
      elements: [],
      tomatoes: [],
      details: '[{"type":"title","children":[{"text":"x"}]},{"type":"p","children":[{"text":"empty"}]}]',
    };

    setNewElement(newElement);
    setMobileView("details");
  }

  const handleBackToTree = () => {
    setMobileView("tree");
  };

  const updateNewElement = (propertyName, propertyValue) => {
    setNewElement({ ...newElement, [propertyName]: propertyValue });
  };

  const saveNewElement = (id, details) => {
    setNewElement({ ...newElement, elementId: id, details: details, detailsType: "Slate" });
  };

  useEffect(() => {
    console.log("NewElement: " + newElement);
    console.log("NEwElementId: =" + newElement?.elementId);
    if (newElement && newElement.elementId) {
      addElementToTree(newElement);
      nodeSelect(newElement.elementId);
      setNewElement(null);
    }
  }, [newElement && newElement.elementId]);

  function addElementToTree(element) {
    let parent = findElement(list, element.parentId);
    parent.elements.push(element);
    setTreeVersion((v) => v + 1);
  }

  function removeElementFromTheTree(element) {
    let parent = findElement(list, element.parentId);
    var index = parent.elements.indexOf(element);
    parent.elements.splice(index, 1);
    setTreeVersion((v) => v + 1);
  }

  const hasTreeLoaded = Boolean(list && !Array.isArray(list) && list.elementId !== undefined);
  const liveInboxElements = useMemo(() => (hasTreeLoaded ? getInboxElements(list) : []), [hasTreeLoaded, list]);

  useEffect(() => {
    if (!hasTreeLoaded) return;
    const compact = liveInboxElements.map((item) => ({
      elementId: item.elementId,
      inboxName: item.inboxName,
    }));
    saveCachedInboxes(compact);
    setCachedInboxes(compact);
  }, [hasTreeLoaded, liveInboxElements]);

  const inboxElements = hasTreeLoaded ? liveInboxElements : cachedInboxes;

  const handleNodeToggle = (event, nodeIds) => {
    setExpandedNodes(nodeIds);
  };

  const handleInboxClick = (elementId) => {
    if (hasTreeLoaded) {
      pendingFocusInboxIdRef.current = null;
      applyInboxSelection(list, elementId);
    } else {
      pendingFocusInboxIdRef.current = elementId;
      setMobileView("tree");
    }
  };

  const [addTasksDialogOpen, setAddTasksDialogOpen] = useState(false);
  const [targetInboxItem, setTargetInboxItem] = useState(null);
  const [tasksInputText, setTasksInputText] = useState("");

  const rememberLastUsedInbox = (elementId) => {
    if (elementId === undefined || elementId === null) return;
    saveLastUsedInboxId(elementId);
    setLastUsedInboxId(String(elementId));
  };

  const handleOpenAddTasksDialog = (inboxItem) => {
    if (!inboxItem) return;
    rememberLastUsedInbox(inboxItem.elementId);
    handleInboxClick(inboxItem.elementId);
    setTargetInboxItem(inboxItem);
    setTasksInputText("");
    setAddTasksDialogOpen(true);
  };

  const handleQuickAddClick = () => {
    const resolved = resolveQuickAddInbox(inboxElements, null, lastUsedInboxId);
    if (resolved) {
      handleOpenAddTasksDialog(resolved);
    }
  };

  const handleSwitchDialogInbox = (inboxItem) => {
    if (!inboxItem) return;
    rememberLastUsedInbox(inboxItem.elementId);
    handleInboxClick(inboxItem.elementId);
    setTargetInboxItem(inboxItem);
    setTimeout(() => {
      tasksInputRef.current?.focus();
    }, 0);
  };

  useEffect(() => {
    const request = pendingUrlQuickAddRef.current;
    if (!request?.active || inboxElements.length === 0) return;

    if (request.target) {
      const lower = request.target.toLowerCase();
      const exactMatch = inboxElements.find(
        (item) =>
          item.inboxName?.trim().toLowerCase() === lower ||
          String(item.elementId) === request.target
      );
      if (!exactMatch && !hasTreeLoaded) {
        // Wait for fresh tree in case the requested inbox isn't in localStorage yet
        return;
      }
    }

    const targetInbox = resolveQuickAddInbox(inboxElements, request.target, lastUsedInboxId);
    if (targetInbox) {
      pendingUrlQuickAddRef.current = null;
      clearQuickAddParamsFromUrl();
      handleOpenAddTasksDialog(targetInbox);
    }
  }, [inboxElements, hasTreeLoaded, lastUsedInboxId]);

  const handleCloseAddTasksDialog = () => {
    setAddTasksDialogOpen(false);
    setTargetInboxItem(null);
    setTasksInputText("");
  };

  const handleAddTasksToInbox = () => {
    if (!targetInboxItem || !tasksInputText.trim()) return;
    const lines = tasksInputText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    rememberLastUsedInbox(targetInboxItem.elementId);

    const now = Date.now();
    const newQueuedTasks = lines.map((line, index) => ({
      clientId: `${now}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      parentId: targetInboxItem.elementId,
      inboxName: targetInboxItem.inboxName,
      name: line,
      details: JSON.stringify([
        { type: "title", children: [{ text: line }] },
        { type: "p", children: [{ text: "" }] },
      ]),
      createdAt: new Date().toISOString(),
    }));

    const updatedQueue = [...loadPendingInboxTasks(), ...newQueuedTasks];
    savePendingInboxTasks(updatedQueue);
    setPendingQueueCount(updatedQueue.length);
    pendingFocusInboxIdRef.current = targetInboxItem.elementId;
    mutationSeqRef.current += 1;

    // Close modal immediately so the user can keep adding or move on right away
    setAddTasksDialogOpen(false);
    setTargetInboxItem(null);
    setTasksInputText("");

    flushPendingInboxTasks();
  };

  const handleLogout = () => {
    clearCachedInboxes();
    clearLastUsedInboxId();
    savePendingInboxTasks([]);
    setCachedInboxes([]);
    setLastUsedInboxId(null);
    setPendingQueueCount(0);
    logout();
  };

  const renderItemDetails = () => {
    console.log("selectedElementx1", selectedElement);
    console.log("newElement", newElement);
    if (newElement == null) {
      return (
        <ItemDetails
          selectedElement={selectedElement}
          isRoot={isRootElement(selectedElement)}
          treeVersion={treeVersion}
          finishAction={finishItem}
          unDoneAction={unDoneElement}
          onChange={updateElement}
          isSticky={isSticky}
          onBack={handleBackToTree}
        />
      );
    } else {
      return (
        <ItemDetails
          selectedElement={newElement}
          onChange={updateNewElement}
          saveNewElement={saveNewElement}
          isSticky={isSticky}
          onBack={handleBackToTree}
        />
      );
    }
  };

  return (
    <div className="console">
      <div className="top-bar">
        <div className="inbox-buttons-container">
          {inboxElements.length > 0 && (
            <Button
              size="small"
              variant="contained"
              className="quick-add-btn"
              data-testid="quick-add-btn"
              title="Quick add tasks to your last used inbox"
              onClick={handleQuickAddClick}
            >
              + Quick Add
            </Button>
          )}
          {inboxElements.map((item) => (
            <ButtonGroup
              key={item.elementId}
              size="small"
              className="inbox-button-group"
              variant="outlined"
            >
              <Button
                className={`inbox-shortcut-btn ${selectedElement?.elementId === item.elementId ? "active" : ""}`}
                onClick={() => handleInboxClick(item.elementId)}
              >
                {item.inboxName}
              </Button>
              <Button
                className="inbox-add-btn"
                title={`Add tasks to ${item.inboxName}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAddTasksDialog(item);
                }}
              >
                +
              </Button>
            </ButtonGroup>
          ))}
        </div>
        <div className="top-bar-right">
          {pendingQueueCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={flushPendingInboxTasks}
              disabled={isSyncingQueue}
              className="pending-sync-btn"
              data-testid="pending-sync-indicator"
              title={isSyncingQueue ? "Sending tasks in background..." : "Tap to retry sending queued tasks"}
            >
              {isSyncingQueue ? `Syncing (${pendingQueueCount})...` : `Pending (${pendingQueueCount}) ↻`}
            </Button>
          )}
          <FormControlLabel
            control={
              <Switch
                size="small"
                color="primary"
                checked={showCreatedDate}
                onChange={(e) => setShowCreatedDate(e.target.checked)}
              />
            }
            label="Dates"
            className="show-dates-switch"
          />
          <Button
            variant="outlined"
            size="small"
            onClick={fetchTree}
            className="refresh-btn"
          >
            Refresh
          </Button>
          {!user && (
            <Button
              variant="contained"
              size="small"
              onClick={signInWithGoogle}
              className="login-btn"
            >
              Login
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className={`console-layout ${mobileView === "details" ? "show-details" : "show-tree"}`}>
        <div className="tree-column">
          <DndProvider backend={HTML5Backend}>
            <StructureTree
              list={list}
              isLoading={isTreeLoading}
              nodeSelect={nodeSelect}
              selectedElement={selectedElement}
              expanded={expandedNodes}
              onToggle={handleNodeToggle}
              finishAction={finishItemById}
              unDoneAction={unDoneElementById}
              addAction={addElement}
              removeAction={removeElementFromTheTree}
              changeParentAction={changeParent}
              showCreatedDate={showCreatedDate}
            />
          </DndProvider>
        </div>

        <div className="details-column">
          <div className={`${isSticky ? "sticky-wrapper sticky" : ""}`} ref={ref}>
            {(selectedElement || newElement) ? (
              renderItemDetails()
            ) : (
              <div className="select-placeholder">Select a task from the tree to view details</div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={addTasksDialogOpen}
        onClose={handleCloseAddTasksDialog}
        TransitionProps={{
          onEntered: () => {
            tasksInputRef.current?.focus();
          },
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add tasks to {targetInboxItem?.inboxName || "Inbox"}
        </DialogTitle>
        <DialogContent>
          {inboxElements.length > 1 && (
            <div className="dialog-inbox-selector" data-testid="dialog-inbox-selector">
              {inboxElements.map((item) => {
                const isSelected = targetInboxItem?.elementId === item.elementId;
                return (
                  <button
                    key={item.elementId}
                    type="button"
                    className={`dialog-inbox-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSwitchDialogInbox(item)}
                  >
                    {item.inboxName}
                  </button>
                );
              })}
            </div>
          )}
          <TextField
            autoFocus
            inputRef={tasksInputRef}
            margin="dense"
            label="Tasks (one per line)"
            type="text"
            fullWidth
            multiline
            minRows={4}
            maxRows={10}
            variant="outlined"
            placeholder="Task 1&#10;Task 2&#10;Task 3"
            value={tasksInputText}
            onChange={(e) => setTasksInputText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddTasksDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleAddTasksToInbox}
            variant="contained"
            color="primary"
            disabled={!tasksInputText.trim()}
          >
            {`Add tasks to the ${targetInboxItem?.inboxName || ""}`}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
