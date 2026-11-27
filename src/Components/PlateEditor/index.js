import React, { useMemo, useRef, useState } from "react";
import { HeadingToolbar, Plate } from "@udecode/plate";
import { getEditorPlugins } from "./plugins";
import { ToolbarButtons } from "./ToolbarButtons";
import "./PlateEditor.css";

const DEFAULT_EDITOR_VALUE = [
  { type: "title", children: [{ text: "Task name" }] },
  { type: "p", children: [{ text: "" }] },
];

function normalizeValue(val) {
  if (Array.isArray(val) && val.length > 0) {
    return val;
  }
  return DEFAULT_EDITOR_VALUE;
}

export const PlateEditor = ({
  content,
  forceResetContent,
  contentChanged,
  readOnly = false,
  showDebug = false,
}) => {
  const initialSource = forceResetContent !== undefined ? forceResetContent : content;
  const normalizedInitial = normalizeValue(initialSource);

  const resetCounterRef = useRef(0);
  const prevResetSourceRef = useRef(initialSource);
  const currentValueRef = useRef(normalizedInitial);
  const [debugValue, setDebugValue] = useState(normalizedInitial);

  if (prevResetSourceRef.current !== initialSource) {
    prevResetSourceRef.current = initialSource;
    resetCounterRef.current += 1;
    currentValueRef.current = normalizedInitial;
  }

  const plugins = useMemo(() => getEditorPlugins(), []);
  const editableProps = useMemo(
    () => ({
      placeholder: "Type...",
      spellCheck: true,
    }),
    []
  );

  const handleChange = (newValue) => {
    currentValueRef.current = newValue;
    if (showDebug) {
      setDebugValue(newValue);
    }
    if (contentChanged) {
      contentChanged(newValue);
    }
  };

  return (
    <div className="plate-editor-wrapper">
      <Plate
        key={resetCounterRef.current}
        initialValue={normalizedInitial}
        onChange={handleChange}
        plugins={plugins}
        readOnly={readOnly}
        editableProps={editableProps}
        firstChildren={
          !readOnly ? (
            <HeadingToolbar className="plate-heading-toolbar">
              <ToolbarButtons />
            </HeadingToolbar>
          ) : null
        }
      />

      {showDebug && (
        <div className="plate-debug-panel" data-testid="plate-debug-panel">
          <span>Plate content:</span>
          <br />
          <span>{JSON.stringify(currentValueRef.current || debugValue)}</span>
          <br />
          <span>Reset value:</span>
          <br />
          <span>{JSON.stringify(normalizedInitial)}</span>
        </div>
      )}
    </div>
  );
};

export default PlateEditor;
