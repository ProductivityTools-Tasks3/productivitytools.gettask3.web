import TreeItem from "@material-ui/lab/TreeItem";
//import Collapse from '@material-ui/core/Collapse';
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Menu, MenuItem } from "@mui/material";
import apiService from "../../services/apiService";


export default function StyledTreeItem(props) {
  const { key, nodeId, element, changeParent, unDoneAction, finishAction, onNodeSelect, ...rest } = props;

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

  return (
    <TreeItem
      ref={dragRef}
      className="styledTreeItem"
      elementid={element.elementId}
      {...rest}
      nodeId={nodeId}
      key={key}
      label={
        <Box ref={dropRef} onContextMenu={handleContextMenu}>
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
            className="checkbox"
            checked={itemChecked(element.status)}
            onClick={handleCheckboxClick}
            onChange={() => handleCheckboxChange(element.elementId, itemChecked(element.status))}
          />

          <span
            className={element.status + " " + element.type + " task-name-span"}
            onClick={handleNameClick}
          >
            <span>{element.name}</span>
            <span> [{element.elements.length}]</span>
            <span>{isDragging && "😱"}</span>
            <span> {isOver && <span>Drop Here!</span>}</span>
          </span>
        </Box>
      }
    ></TreeItem>
  );
}
