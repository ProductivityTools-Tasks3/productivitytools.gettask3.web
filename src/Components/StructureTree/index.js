import React, { useState, useRef } from "react";
import TreeView from "@material-ui/lab/TreeView";
import { MdChevronRight, MdExpandMore } from "react-icons/md";
import StyledTreeItem from "./styledTreeItem";

export default function StructureTree(props) {
  const [internalExpanded, setInternalExpanded] = useState([]);
  const containerRef = useRef(null);

  const expanded = props.expanded !== undefined ? props.expanded : internalExpanded;

  const selected =
    props.selectedElement?.elementId != null
      ? props.selectedElement.elementId.toString()
      : props.selected != null
      ? props.selected.toString()
      : "";

  const handleToggle = (event, nodeIds) => {
    if (props.onToggle) {
      props.onToggle(event, nodeIds);
    } else {
      setInternalExpanded(nodeIds);
    }
  };

  // function getLabel(x) {
  //     let l = x.name + " [Id:" + x.id + "]";
  //     return l;
  // }

  // const treeClick = (e, treeId) => {
  //     e.stopPropagation();
  //     props.setSelectedTreeNode(treeId);
  // }

  const changeparent = (element, targetElementId) => {
    console.log("changeParent from Structure tre");
    props.changeParentAction(element, targetElementId);
  };

  const showCreatedDate = props.showCreatedDate !== undefined ? props.showCreatedDate : true;

  //return (nodes.sort((x, y) => (x.type === "TaskBag" && y.type !== "TaskBag") ? -1 : 1).map(x => {
  function GetNode(node) {
    if (node !== undefined) {
      return (
        <StyledTreeItem
          key={node.elementId.toString()}
          nodeId={node.elementId.toString()}
          element={node}
          changeParent={changeparent}
          unDoneAction={props.unDoneAction}
          finishAction={props.finishAction}
          addAction={() => props.addAction(node.elementId)}
          removeAction={props.removeAction}
          onNodeSelect={props.nodeSelect}
          showCreatedDate={showCreatedDate}
        >
          {node?.elements
            ?.sort((x, y) => (x.type === "TaskBag" && y.type !== "TaskBag" ? -1 : 1))
            .map((x) => GetNode(x))}
        </StyledTreeItem>
      );
    }
  }

  if (props && props.list && props.list.elements) {
    return (
      <div ref={containerRef} className="structureTree">
        <TreeView
          defaultCollapseIcon={<MdExpandMore className="tree-arrow-icon" />}
          defaultExpandIcon={<MdChevronRight className="tree-arrow-icon" />}
          defaultEndIcon={<span className="tree-leaf-spacer" />}
          onNodeToggle={handleToggle}
          expanded={expanded}
          selected={selected}
          className="tree"
        >
          {GetNode(props.list)}
        </TreeView>
      </div>
    );
  } else {
    return <div>still nothing</div>;
  }
}
