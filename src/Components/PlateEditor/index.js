import React, { useEffect, useMemo, useRef, useState } from "react";
import { HeadingToolbar, Plate, PlateProvider, useResetPlateEditor } from "@udecode/plate";
import { getEditorPlugins } from "./plugins";
import { ToolbarButtons } from "./ToolbarButtons";
import "./PlateEditor.css";

const ResetEditorOnValueChange = ({ value }) => {
  const resetPlateEditor = useResetPlateEditor();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    resetPlateEditor();
  }, [value, resetPlateEditor]);

  return null;
};

export const PlateEditor = ({
  content,
  forceResetContent,
  contentChanged,
  readOnly = false,
  showDebug = false,
}) => {
  const [value, setValue] = useState(content);
  const [resetValue, setResetValue] = useState(content);

  useEffect(() => {
    setValue(forceResetContent);
    setResetValue(forceResetContent);
  }, [forceResetContent]);

  const change = (e) => {
    setValue(e);
    if (contentChanged) {
      contentChanged(e);
    }
  };

  const editableProps = {
    placeholder: "Type...",
  };

  const plugins = useMemo(() => getEditorPlugins(), []);

  return (
    <div className="plate-editor-wrapper">
      <PlateProvider value={value} onChange={change} plugins={plugins}>
        <div className="plate-toolbar-container">
          <HeadingToolbar>
            <ToolbarButtons />
          </HeadingToolbar>
        </div>
        <Plate editableProps={editableProps} readOnly={readOnly}>
          <ResetEditorOnValueChange value={resetValue} />
        </Plate>
      </PlateProvider>

      {showDebug && (
        <div className="plate-debug-panel" data-testid="plate-debug-panel">
          <span>Plate content:</span>
          <br />
          <span>{JSON.stringify(value)}</span>
          <br />
          <span>Reset value:</span>
          <br />
          <span>{JSON.stringify(resetValue)}</span>
        </div>
      )}
    </div>
  );
};

export default PlateEditor;
