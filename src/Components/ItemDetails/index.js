import Button from "@mui/material/Button";
import React, { useEffect, useState } from "react";
import {
  MdSave,
  MdPlayArrow,
  MdCheckCircleOutline,
  MdUndo,
  MdInbox,
} from "react-icons/md";

import apiService from "../../services/apiService";
import {
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import PlateEditor from "../PlateEditor";
import BagCharts from "../BagCharts";

function formatHeaderDate(value) {
  if (!value) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("0001-01-01")) return null;
    const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const parsed = new Date(value);
  if (isNaN(parsed.getTime()) || parsed.getFullYear() <= 1) return null;
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function ItemDetails({ selectedElement, isRoot = false, treeVersion = 0, showDebug = false, onChange, saveNewElement, finishAction, unDoneAction, onBack }) {
  console.log("Selectedelement", selectedElement);
  const [details, setDetails] = useState(
    JSON.parse(`[{"type":"title","children":[{"text":"Task name"}]},{"type":"p","children":[{"text":""}]}]`)
  );

  const [initialValue, setInitialValue] = useState(
    JSON.parse(`[{"type":"title","children":[{"text":"Task name"}]},{"type":"p","children":[{"text":""}]}]`)
  );

  const [inboxDialogOpen, setInboxDialogOpen] = useState(false);
  const [inboxNameInput, setInboxNameInput] = useState("");

  useEffect(() => {
    console.log("selectedElementdetails", selectedElement?.details);
    console.log("selectedElement", selectedElement);
    if (selectedElement?.details) {
      try {
        const parsed = JSON.parse(selectedElement.details);
        setDetails(parsed);
        setInitialValue(parsed);
      } catch (err) {
        console.error("Failed to parse details JSON", err);
      }
    } else if (selectedElement) {
      const defaultVal = [
        { type: "title", children: [{ text: selectedElement.name || "" }] },
        { type: "p", children: [{ text: "" }] },
      ];
      setDetails(defaultVal);
      setInitialValue(defaultVal);
    }
  }, [selectedElement?.elementId]);

  const updateElement = async () => {
    let newValue = JSON.stringify(details);
    if (selectedElement.elementId === null) {
      let newId = await apiService.addElement(selectedElement.parentId, selectedElement.name, newValue);
      saveNewElement(newId, newValue);
    } else {
      await apiService.updateElement(selectedElement.parentId, selectedElement.elementId, selectedElement.name, newValue);
      onChange("details", newValue);
    }
  };

  const startElement = (e) => {
    onChange("status", "InProgress");
    apiService.start(selectedElement.elementId);
  };

  const plateChanged = (e) => {
    console.log("PlateChanged");
    console.log(e);
    setDetails(e);
    let title = e?.[0]?.children?.[0]?.text;
    console.log(title);
    if (title !== undefined) {
      onChange("name", title);
    }
  };

  const switchChanged = async () => {
    if (selectedElement.type === "TaskBag") {
      let result = await apiService.changeType(selectedElement.elementId, "Task");
      if (result) {
        onChange("type", "Task");
      }
    } else {
      let result = await apiService.changeType(selectedElement.elementId, "TaskBag");
      if (result) {
        onChange("type", "TaskBag");
      }
    }
  };

  const handleOpenInboxDialog = () => {
    setInboxNameInput(selectedElement?.inboxName || "");
    setInboxDialogOpen(true);
  };

  const handleCloseInboxDialog = () => {
    setInboxDialogOpen(false);
  };

  const handleSaveInboxName = async () => {
    const trimmed = inboxNameInput.trim();
    if (selectedElement?.elementId !== null && selectedElement?.elementId !== undefined) {
      if (trimmed) {
        await apiService.setInboxName(selectedElement.elementId, trimmed);
        onChange("inboxName", trimmed);
      } else {
        await apiService.clearInboxName(selectedElement.elementId);
        onChange("inboxName", null);
      }
    } else {
      onChange("inboxName", trimmed || null);
    }
    setInboxDialogOpen(false);
  };

  const handleClearInboxName = async () => {
    if (selectedElement?.elementId !== null && selectedElement?.elementId !== undefined) {
      await apiService.clearInboxName(selectedElement.elementId);
    }
    onChange("inboxName", null);
    setInboxNameInput("");
    setInboxDialogOpen(false);
  };

  console.log("rendering item details");
  console.log(selectedElement);
  const isRootNode = Boolean(isRoot || selectedElement?.type === "User" || selectedElement?.parentId === null);
  const isBagNode = selectedElement?.type === "TaskBag" || selectedElement?.type === "User";
  const createdDateLabel = formatHeaderDate(selectedElement?.created || selectedElement?.Created);
  if (selectedElement != null) {
    return (
      <div className="itemDetails sticky-inner">
        <div className="task-details-card">
          <div className="task-card-header">
            <div className="task-card-header-left">
              {onBack && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={onBack}
                  className="back-btn"
                >
                  ← Tasks
                </Button>
              )}

              {selectedElement?.status && (
                <span className={`status-badge status-${selectedElement.status.toLowerCase()}`}>
                  {selectedElement.status}
                </span>
              )}

              <FormControlLabel
                control={<Switch size="small" color="primary" />}
                label="Bag"
                className="bag-switch"
                checked={selectedElement.type === "TaskBag" || selectedElement.type === "User"}
                onChange={switchChanged}
              />

              <Button
                variant="outlined"
                size="small"
                startIcon={<MdInbox size={14} />}
                onClick={handleOpenInboxDialog}
                className="inbox-name-btn"
              >
                {selectedElement.inboxName ? selectedElement.inboxName : "Set inbox name"}
              </Button>
            </div>

            {createdDateLabel && (
              <span className="task-card-date" title={`Created: ${createdDateLabel}`}>
                {createdDateLabel}
              </span>
            )}
          </div>

          <PlateEditor
            contentChanged={plateChanged}
            content={initialValue}
            forceResetContent={initialValue}
            showDebug={showDebug}
          />

          <div className="itemDetails-actions" data-testid="item-details-actions">
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<MdSave size={15} />}
              onClick={updateElement}
              className="action-btn action-btn-save"
            >
              Save
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MdPlayArrow size={16} />}
              disabled={!finishAction}
              onClick={startElement}
              className="action-btn action-btn-start"
            >
              Start
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MdCheckCircleOutline size={15} />}
              disabled={!finishAction || isRootNode}
              onClick={finishAction}
              className="action-btn action-btn-finish"
            >
              Finish
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MdUndo size={15} />}
              disabled={!unDoneAction}
              onClick={unDoneAction}
              className="action-btn action-btn-undone"
            >
              Undone
            </Button>
          </div>
        </div>

        {isBagNode && selectedElement.elementId !== null && selectedElement.elementId !== undefined && (
          <BagCharts bagElement={selectedElement} treeVersion={treeVersion} />
        )}

        <Dialog open={inboxDialogOpen} onClose={handleCloseInboxDialog} maxWidth="xs" fullWidth>
          <DialogTitle>Set Inbox Name</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Inbox Name"
              type="text"
              fullWidth
              variant="outlined"
              value={inboxNameInput}
              onChange={(e) => setInboxNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveInboxName();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClearInboxName} color="error">
              Clear
            </Button>
            <Button onClick={handleCloseInboxDialog}>Cancel</Button>
            <Button onClick={handleSaveInboxName} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  } else {
    return <div>Select element to see details</div>;
  }
}
