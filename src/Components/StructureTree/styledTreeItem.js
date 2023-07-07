import TreeItem from "@material-ui/lab/TreeItem";
//import Collapse from '@material-ui/core/Collapse';

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";

import { useDrag, useDrop } from "react-dnd";

export default function StyledTreeItem(props) {
  // console.log("props");
  // console.log(props);
  const {key,nodeId, element, changeParent, unDoneAction, finishAction, ...rest } = props;
  // console.log("el");
  // console.log(element);

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

  return (
    <TreeItem
      ref={dragRef}
      className="styledTreeItem"
      elementid={element.elementId}
      {...rest}
      nodeId={nodeId}
      key={key}
      label={
        <Box ref={dropRef}>
          <Checkbox
            className="checkbox"
            checked={itemChecked(element.status)}
            onChange={() => handleCheckboxChange(element.elementId, itemChecked(element.status))}
          />
          <span className={element.status + " " + element.type}>
            <span>[{element.status}] </span>
            <span>{element.name}</span>
            <span>[{element.elements.length}]</span>
            <span>{isDragging && "😱"}</span>
            <span> {isOver && <span>Drop Here!</span>}</span>
          </span>
          {/* <span className='elementId'>{element.elementId}</span> */}
        </Box>
      }
    ></TreeItem>
  );
}
