import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import React, { useEffect, useState } from "react";

import apiService from "../../services/apiService";
import SlateEditor from "../SlateEditor";
import { FormControlLabel, Switch } from "@mui/material";

import { PTPlate } from "productivitytools.plate";

export default function ItemDetails({ selectedElement, onChange, saveNewElement, finishAction, unDoneAction }) {
  console.log("Selectedelement", selectedElement);
  const [details, setDetails] = useState(
    JSON.parse(`[{"type":"title","children":[{"text":"x"}]},{"type":"p","children":[{"text":"empty"}]}]`)
  );

  const [initialValue, setInitialValue] = useState(
    JSON.parse(`[{"type":"title","children":[{"text":"x"}]},{"type":"p","children":[{"text":"empty"}]}]`)
  );

  useEffect(() => {
    console.log("selectedElementdetails", selectedElement.details);
    console.log("selectedElement", selectedElement);
    setInitialValue(JSON.parse(selectedElement.details));
  }, [selectedElement?.elementId]);

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

  // const updateTitle = (title) => {
  //   onChange("name", title);
  // };

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

  // const getSlateStructureFromRawDetails = (rawDetails, title) => {
  //   let template = [
  //     {
  //       type: "title",
  //       children: [{ text: title || "Title" }],
  //     },
  //     {
  //       type: "paragraph",
  //       children: [{ text: rawDetails || "No data" }],
  //     },
  //   ];
  //   return template;
  // };

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

        <PTPlate contentChanged={ptplateChanged} content={initialValue} forceResetContent={initialValue}></PTPlate>
      </div>
    );
  } else {
    return <div>Select element to see details</div>;
  }
}
