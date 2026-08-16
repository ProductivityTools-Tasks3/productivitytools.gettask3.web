import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import React, { useEffect, useState } from "react";

import apiService from "../../services/apiService";
import { FormControlLabel, Switch } from "@mui/material";
import PlateEditor from "../PlateEditor";

export default function ItemDetails({ selectedElement, onChange, saveNewElement, finishAction, unDoneAction }) {
  console.log("Selectedelement", selectedElement);
  const [details, setDetails] = useState(
    JSON.parse(`[{"type":"title","children":[{"text":"x"}]},{"type":"p","children":[{"text":"empty"}]}]`)
  );

  const [initialValue, setInitialValue] = useState(
    JSON.parse(`[{"type":"title","children":[{"text":"x"}]},{"type":"p","children":[{"text":"empty"}]}]`)
  );

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

  console.log("rendering item details");
  console.log(selectedElement);
  if (selectedElement != null) {
    return (
      <div className="itemDetails sticky-inner">
        <Stack spacing={1.5} direction="row" alignItems="center" className="itemDetails-actions">
          <Button
            variant={`${finishAction ? "contained" : "disabled"}`}
            onClick={finishAction}
            className="action-btn"
          >
            FINISH
          </Button>
          <Button
            variant={`${unDoneAction ? "contained" : "disabled"}`}
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
            variant={`${finishAction ? "contained" : "disabled"}`}
            onClick={startElement}
            className="action-btn"
          >
            START
          </Button>
          <FormControlLabel
            control={<Switch color="primary" />}
            label="Bag"
            className="bag-switch"
            checked={selectedElement.type === "TaskBag" || selectedElement.type === "User"}
            onChange={switchChanged}
          ></FormControlLabel>
        </Stack>

        <PlateEditor contentChanged={plateChanged} content={initialValue} forceResetContent={initialValue}></PlateEditor>
      </div>
    );
  } else {
    return <div>Select element to see details</div>;
  }
}
