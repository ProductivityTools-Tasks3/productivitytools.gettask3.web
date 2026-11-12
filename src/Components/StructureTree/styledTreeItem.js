import TreeItem from "@material-ui/lab/TreeItem";
//import Collapse from '@material-ui/core/Collapse';
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Menu, MenuItem } from "@mui/material";
import apiService from "../../services/apiService";


function formatCreatedDate(created) {
  if (!created) return null;
  if (typeof created === "string") {
    const trimmed = created.trim();
    if (trimmed.startsWith("0001-01-01")) return null;
    const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return match[1];
    }
  }
  const date = new Date(created);
  if (isNaN(date.getTime()) || date.getFullYear() <= 1) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function StyledTreeItem(props) {
  const {
    key,
    nodeId,
    element,
    isRoot = false,
    changeParent,
    unDoneAction,
    finishAction,
    onNodeSelect,
    showCreatedDate = true,
    ...rest
  } = props;

  const isRootNode = Boolean(isRoot || element?.type === "User" || element?.parentId === null);

  const [{ isDragging }, dragRef] = useDrag({
    type: "pet",
    item: element,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, dropRef] = useDrop({
    accept: "pet",
    drop: (item) => {
      console.log(item);
      changeParent(item, element.elementId);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const itemChecked = (status) => {
    if (status === "Finished") {
      return true;
    } else {
      return false;
    }
  };

  const handleCheckboxChange = (elementId, value) => {
    if (isRootNode) return;
    if (value) {
      console.log("undone1");
      unDoneAction(elementId, "New");
    } else {
      finishAction(elementId, "Finished");
    }
  };

  const [contextMenu, setContextMenu] = useState(null);
  const handleContextMenu = (event) => {
    setContextMenu(null);
    console.log("handleContextMenu");
    console.log(event);
    event.preventDefault();
    setContextMenu(contextMenu == null ? { mouseX: event.clientX + 2, mouseY: event.clientY - 6 } : null);
  };

  const handleClose = () => {
    console.log(props);
    setContextMenu(null);
  };

  const newTask = (event) => {
    props.addAction();
    setContextMenu(null);
    event.preventDefault();
  };

  const remove = (element) => {
    console.log("remove", element);
    apiService.remove(element.elementId);
    props.removeAction(element);
  };

  const handleNameClick = (e) => {
    e.stopPropagation();
    if (onNodeSelect) {
      onNodeSelect(element.elementId);
    }
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
  };

  const hasInboxName = Boolean(element?.inboxName?.trim());
  const createdDate = formatCreatedDate(element?.created || element?.Created);

  return (
    <TreeItem
      ref={dragRef}
      className="styledTreeItem"
      elementid={element.elementId}
      {...rest}
      nodeId={nodeId}
      key={key}
      label={
        <Box ref={dropRef} onClick={handleNameClick} onContextMenu={handleContextMenu} className="tree-node-box">
          <Menu
            open={contextMenu !== null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
          >
            <MenuItem onClick={newTask}>New task under &nbsp;<b>{element.name}</b></MenuItem>
            <MenuItem onClick={() => remove(element)}>Remove &nbsp;<b>{element.name}</b></MenuItem>
          </Menu>
          <Checkbox
            className="checkbox task-checkbox"
            size="small"
            disabled={isRootNode}
            checked={itemChecked(element.status)}
            onClick={handleCheckboxClick}
            onChange={() => handleCheckboxChange(element.elementId, itemChecked(element.status))}
          />

          <span
            className={`${element.status} ${element.type} task-name-span ${hasInboxName ? "has-inbox-name" : ""}`}
            onClick={handleNameClick}
          >
            <span className="task-name-text">{element.name}</span>
            {element.elements && element.elements.length > 0 && (
              <span className="task-count-badge">{element.elements.length}</span>
            )}
            {showCreatedDate && createdDate && (
              <span className="task-created-date">{createdDate}</span>
            )}
            {isDragging && <span> 😱</span>}
            {isOver && <span className="drop-indicator">Drop Here!</span>}
          </span>
        </Box>
      }
    ></TreeItem>
  );
}
