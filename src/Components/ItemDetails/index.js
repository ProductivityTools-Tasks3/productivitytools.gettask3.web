import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import React, { useState } from "react";

import apiService from "../../services/apiService";
import SlateEditor from "../SlateEditor";
import { FormControlLabel, Switch } from "@mui/material";

export default function ItemDetails({ selectedElement, onChange, saveNewElement, finishAction, unDoneAction }) {
  // const dateFormat = "YYYY-MM-DD HH:MM:SS";
  const [details, setDetails] = useState({});

  const detailsChanged = (value) => {
    setDetails(value);
  };

  const updateElement = async () => {
    let newValue = JSON.stringify(details);
    if (selectedElement.elementId === null) {
      let newId = await apiService.addElement(selectedElement.parentId, selectedElement.name, newValue);
      saveNewElement(newId, newValue);
    } else {
      apiService.updateElement(selectedElement.parentId, selectedElement.elementId, selectedElement.name, newValue);
    }
  };

  const startElement = (e) => {
    onChange("status", "InProgress");
    apiService.start(selectedElement.elementId);
  };

  const updateTitle = (title) => {
    onChange("name", title);
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
        <Stack spacing={2} direction="row">
          <Button variant={`${finishAction ? "contained" : "disabled"}`} onClick={finishAction}>
            Finish
          </Button>
          <Button variant={`${unDoneAction ? "contained" : "disabled"}`} onClick={unDoneAction}>
            Undone
          </Button>
          <Button variant="contained" onClick={updateElement}>
            Save
          </Button>
          <Button variant={`${finishAction ? "contained" : "disabled"}`} onClick={startElement}>
            Start
          </Button>
          <FormControlLabel
            control={<Switch />}
            label="Bag"
            checked={selectedElement.type === "TaskBag" || selectedElement.type === "User"}
            onChange={switchChanged}
          ></FormControlLabel>
        </Stack>

        {/* <p><span>Name: </span><input type="text" name="name" value={selectedElement.name} onChange={handleChange} style={{ width: "90%" }} ></input></p>
            <p><span>Status: </span><span>{selectedElement.status}</span></p> */}
        <SlateEditor
          selectedElement={selectedElement}
          detailsChanged={detailsChanged}
          titleChanged={updateTitle}
        ></SlateEditor>

        {/* 
            <p><span>Created: </span><span><Moment format={dateFormat}>{selectedElement.created}</Moment></span></p>
            <p><span>Started: </span><span><Moment format={dateFormat}>{selectedElement.started}</Moment></span></p>
            <p><span>Finished: </span><span><Moment format={dateFormat}> {selectedElement.finished}</Moment></span></p>
            <hr />
            <p><span>ElementId: </span><span>{selectedElement.elementId}</span></p>
            <p><span>ParentId: </span><span>{selectedElement.parentId}</span></p>
            <p><span>Details: </span><textarea name="details" value={selectedElement.details == null ? "" : selectedElement.details} onChange={handleChange} style={{ width: "90%" }} ></textarea></p>
            <p><span>Amout of child elements: </span><span>{selectedElement.elements.length}</span></p>

            <p>{props.isSticky ? "sticky - glue to top" : "notsticy - not glue to top"}</p> */}
      </div>
    );
  } else {
    return <div>empty</div>;
  }
}
