import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import React, { useEffect, useState } from "react";

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

export default function ItemDetails({ selectedElement, isRoot = false, treeVersion = 0, showDebug = false, onChange, saveNewElement, finishAction, unDoneAction, onBack }) {
  console.log("Selectedelement", selectedElement);
  const [details, setDetails] = useState(
    JSON.parse(`[{"type":"title","children":[{"text":"x"}]},{"type":"p","children":[{"text":"empty"}]}]`)
  );

  const [initialValue, setInitialValue] = useState(
    JSON.parse(`[{"type":"title","children":[{"text":"x"}]},{"type":"p","children":[{"text":"empty"}]}]`)
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
  if (selectedElement != null) {
    return (
      <div className="itemDetails sticky-inner">
        <Stack spacing={1} direction="row" alignItems="center" className="itemDetails-actions" flexWrap="wrap">
          {onBack && (
            <Button
              variant="outlined"
              onClick={onBack}
              className="back-btn"
            >
              ← Tasks
            </Button>
          )}
          <Button
            variant="contained"
            disabled={!finishAction || isRootNode}
            onClick={finishAction}
            className="action-btn"
          >
            FINISH
          </Button>
          <Button
            variant="contained"
            disabled={!unDoneAction}
            onClick={unDoneAction}
            className="action-btn"
          >
            UNDONE
          </Button>
          <Button
            variant="contained"
            onClick={updateElement}
            className="action-btn"
          >
            SAVE
          </Button>
          <Button
            variant="contained"
            disabled={!finishAction}
            onClick={startElement}
            className="action-btn"
          >
            START
          </Button>

          {selectedElement?.status && (
            <span className={`status-badge status-${selectedElement.status.toLowerCase()}`}>
              {selectedElement.status}
            </span>
          )}

          <FormControlLabel
            control={<Switch color="primary" />}
            label="Bag"
            className="bag-switch"
            checked={selectedElement.type === "TaskBag" || selectedElement.type === "User"}
            onChange={switchChanged}
          ></FormControlLabel>

          <Button
            variant="outlined"
            onClick={handleOpenInboxDialog}
            className="inbox-name-btn"
          >
            {selectedElement.inboxName ? selectedElement.inboxName : "Set inbox name"}
          </Button>
        </Stack>

        <PlateEditor contentChanged={plateChanged} content={initialValue} forceResetContent={initialValue} showDebug={showDebug}></PlateEditor>

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
