import React, { useState, useRef } from "react";

import SvgIcon from "@material-ui/core/SvgIcon";

import TreeView from "@material-ui/lab/TreeView";

import StyledTreeItem from "./styledTreeItem";

import ContextMenu from "../ContextMenu";
//import { FOCUSABLE_SELECTOR } from '@testing-library/user-event/dist/utils';

function MinusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
}

function PlusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  );
}

function CloseSquare(props) {
  return (
    <SvgIcon className="close" fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
    </SvgIcon>
  );
}

export default function StructureTree(props) {
  const [expanded, setExpanded] = useState([]);
  const containerRef = useRef(null);

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
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
        >
          {node?.elements
            ?.sort((x, y) => (x.type === "TaskBag" && y.type !== "TaskBag" ? -1 : 1))
            .map((x) => GetNode(x))}
        </StyledTreeItem>
      );
    }
  }

  function nodeSelect(e, id) {
    console.log(id);
    props.nodeSelect(id);
  }

  const menuItems = [
    {
      text: "Add",
      onclick: (event, selectedTreeId) => {
        props.addAction(event, selectedTreeId);
        console.log(`Add element`);
      },
    },
    {
      text: "Add new tree item",
      onclick: (treeId) => {
        props.setSelectedTreeNode(treeId);
      },
    },
    {
      text: "Delete",
      onclick: (treeId) => {
        props.setSelectedTreeNode(treeId);
      },
    },
  ];

  if (props && props.list && props.list.elements) {
    return (
      <div ref={containerRef} className="structureTree">
        <p>treeview below</p>
        <TreeView
          defaultCollapseIcon={<MinusSquare />}
          defaultExpandIcon={<PlusSquare />}
          defaultEndIcon={<CloseSquare />}
          onNodeToggle={handleToggle}
          expanded={expanded}
          onNodeSelect={nodeSelect}
          className="tree"
        >
          {GetNode(props.list)}
        </TreeView>
        <ContextMenu parentRef={containerRef} items={menuItems} />
      </div>
    );
  } else {
    return <div>still nothing</div>;
  }
}
