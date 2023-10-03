import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import React, { useEffect, useState } from "react";

import apiService from "../../services/apiService";
import SlateEditor from "../SlateEditor";
import { FormControlLabel, Switch } from "@mui/material";

import { PTPlate } from "productivitytools.plate";

export default function ItemDetails({ selectedElement, onChange, saveNewElement, finishAction, unDoneAction }) {
  // const dateFormat = "YYYY-MM-DD HH:MM:SS";
  const [details, setDetails] = useState(
    JSON.parse(`[{"type":"title","children":[{"text":"x"}]},{"type":"p","children":[{"text":"empty"}]}]`)
  );

  const [initialValue, setInitialValue] = useState(
    JSON.parse(`[{"type":"title","children":[{"text":"x"}]},{"type":"p","children":[{"text":"empty"}]}]`)
  );

  useEffect(() => {
    setInitialValue(JSON.parse(selectedElement.details));
  }, [selectedElement.elementId]);

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

  const ptplateChanged = (e) => {
    console.log("PTPlateChanged");
    console.log(e);
    setDetails(e);
    let title = e[0].children[0].text;
    console.log(title);
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

  const getSlateStructureFromRawDetails = (rawDetails, title) => {
    let template = [
      {
        type: "title",
        children: [{ text: title || "Title" }],
      },
      {
        type: "paragraph",
        children: [{ text: rawDetails || "No data" }],
      },
    ];
    return template;
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
        {/* ================ */}
        {/* <SlateEditor
          selectedElement={selectedElement}
          detailsChanged={detailsChanged}
          titleChanged={updateTitle}
        ></SlateEditor> */}
        {/* <PTPlate contentChanged={ptplateChanged} content={getSlateStructureFromRawDetails("dd","ddd")}></PTPlate> */}
        <PTPlate contentChanged={ptplateChanged} content={initialValue} forceResetContent={initialValue}></PTPlate>
        {/* ================= */}
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
