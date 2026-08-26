import React, { useEffect, useState, useRef, useMemo } from "react";
import Button from "@mui/material/Button";
import apiService from "../../services/apiService";
import { signInWithGoogle } from "../../Session/firebase";

import StructureTree from "../StructureTree";
import ItemDetails from "../ItemDetails";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function getInboxElements(nodeOrList) {
  if (!nodeOrList) return [];
  let result = [];
  if (Array.isArray(nodeOrList)) {
    for (const item of nodeOrList) {
      result = result.concat(getInboxElements(item));
    }
    return result;
  }
  if (nodeOrList.inboxName && typeof nodeOrList.inboxName === "string" && nodeOrList.inboxName.trim() !== "") {
    result.push(nodeOrList);
  }
  if (nodeOrList.elements && Array.isArray(nodeOrList.elements)) {
    for (const child of nodeOrList.elements) {
      result = result.concat(getInboxElements(child));
    }
  }
  return result;
}

function getPathToElement(root, targetId) {
  if (!root || targetId === null || targetId === undefined) return [];
  const targetIdStr = targetId.toString();

  function findPath(node) {
    if (!node) return null;
    const currentIdStr = node.elementId !== undefined && node.elementId !== null ? node.elementId.toString() : "";
    if (currentIdStr === targetIdStr) {
      return [currentIdStr];
    }
    if (node.elements && Array.isArray(node.elements)) {
      for (const child of node.elements) {
        const subPath = findPath(child);
        if (subPath) {
          return [currentIdStr, ...subPath];
        }
      }
    }
    return null;
  }

  if (Array.isArray(root)) {
    for (const item of root) {
      const p = findPath(item);
      if (p) return p;
    }
    return [];
  }

  return findPath(root) || [];
}

export default function Console() {
  const [list, setList] = useState([]);
  const [selectedElement, setSelectedElement] = useState();
  const [newElement, setNewElement] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState([]);

  const [isSticky, setSticky] = useState(false);
  const ref = useRef(null);
  const handleScroll = () => {
    if (ref.current) {
      setSticky(ref.current.getBoundingClientRect().top <= 0);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", () => handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      console.log("call apiservice");
      const r = await apiService.GetTree();
      console.log(r);
      setList(r);
    };
    fetchData();
    console.log("useeffect");
  }, []);

  function findElement(candidateElement, nodeId) {
    var candidateElementId = candidateElement.elementId.toString();
    //console.log(candidateElement.elementId);
    // console.log(candidateElementId);
    if (candidateElementId == nodeId) {
      return candidateElement;
    } else {
      for (var i = 0; i < candidateElement.elements.length; i += 1) {
        var newCandidateElement = candidateElement.elements[i];
        var result = findElement(newCandidateElement, nodeId);
        if (result != null) {
          return result;
        }
      }
    }
  }

  function updateStatus(elementToUpdate, newStatus) {
    if (!elementToUpdate) return;
    setSelectedElement((prev) => (prev ? { ...prev, status: newStatus } : prev));

    let newList = { ...list };
    let element = findElement(newList, elementToUpdate.elementId);
    if (element) {
      element.status = newStatus;
    }
    setList(newList);
  }

  function updateElementInList(elementToUpdate, propertyName, propertyValue) {
    if (!elementToUpdate) return;
    setSelectedElement((prev) => (prev ? { ...prev, [propertyName]: propertyValue } : prev));
    let newList = { ...list };
    let element = findElement(newList, elementToUpdate.elementId);
    if (element) {
      element[propertyName] = propertyValue;
    }
    setList(newList);
  }

  function finishItem() {
    finishThisItem(selectedElement);
  }

  function finishItemById(elementId) {
    let element = findElement(list, elementId);
    finishThisItem(element);
  }

  function finishThisItem(elementToUpdate) {
    console.log("Finish.thisitem");
    updateStatus(elementToUpdate, "Finished");
    apiService.finish(elementToUpdate.elementId);
  }

  function unDoneElement() {
    unDoneThisElement(selectedElement);
  }

  function unDoneElementById(elementId) {
    console.log("undone");
    let element = findElement(list, elementId);
    unDoneThisElement(element);
  }

  function unDoneThisElement(elementToUpdate) {
    updateStatus(elementToUpdate, "New");
    apiService.unDone(elementToUpdate.elementId);
  }

  const [mobileView, setMobileView] = useState("tree");

  function nodeSelect(nodeId) {
    var se = findElement(list, nodeId);
    console.log("Set selected element", se);
    setSelectedElement(se);
    setMobileView("details");
  }

  function updateElement(propertyName, propertyValue) {
    console.log("Console update element" + propertyName);
    updateElementInList(selectedElement, propertyName, propertyValue);
  }

  function changeParent(child, newParentId) {
    var childobject = findElement(list, child.elementId);
    var currentparent = findElement(list, child.parentId);
    currentparent.elements = currentparent.elements.filter((item) => item !== childobject);
    var parentobject = findElement(list, newParentId);
    parentobject.elements.push(childobject);
    updateElementInList(child, "parentId", newParentId);
    apiService.moveElement(child.elementId, newParentId);
  }

  function addElement(selectedTreeId) {
    let newElement = {
      name: "New element",
      type: 2,
      elementId: null,
      parentId: selectedTreeId,
      status: "New",
      created: "2021-11-08T07:17:32.639432",
      initialization: "2021-11-08T07:17:32.6394877",
      started: "0001-01-01T00:00:00",
      finished: null,
      category: null,
      elements: [],
      tomatoes: [],
      details: '[{"type":"title","children":[{"text":"x"}]},{"type":"p","children":[{"text":"empty"}]}]',
    };

    setNewElement(newElement);
    setMobileView("details");
  }

  const handleBackToTree = () => {
    setMobileView("tree");
  };

  const updateNewElement = (propertyName, propertyValue) => {
    setNewElement({ ...newElement, [propertyName]: propertyValue });
  };

  const saveNewElement = (id, details) => {
    setNewElement({ ...newElement, elementId: id, details: details, detailsType: "Slate" });
  };

  useEffect(() => {
    console.log("NewElement: " + newElement);
    console.log("NEwElementId: =" + newElement?.elementId);
    if (newElement && newElement.elementId) {
      addElementToTree(newElement);
      nodeSelect(newElement.elementId);
      setNewElement(null);
    }
  }, [newElement && newElement.elementId]);

  function addElementToTree(element) {
    let parent = findElement(list, element.parentId);
    parent.elements.push(element);
  }

  function removeElementFromTheTree(element) {
    let parent = findElement(list, element.parentId);
    var index = parent.elements.indexOf(element);
    parent.elements.splice(index, 1);
  }

  const inboxElements = useMemo(() => getInboxElements(list), [list]);

  const handleNodeToggle = (event, nodeIds) => {
    setExpandedNodes(nodeIds);
  };

  const handleInboxClick = (elementId) => {
    const pathIds = getPathToElement(list, elementId);
    setExpandedNodes(pathIds);
    nodeSelect(elementId);
  };

  const renderItemDetails = () => {
    console.log("selectedElementx1", selectedElement);
    console.log("newElement", newElement);
    if (newElement == null) {
      return (
        <ItemDetails
          selectedElement={selectedElement}
          finishAction={finishItem}
          unDoneAction={unDoneElement}
          onChange={updateElement}
          isSticky={isSticky}
          onBack={handleBackToTree}
        />
      );
    } else {
      return (
        <ItemDetails
          selectedElement={newElement}
          onChange={updateNewElement}
          saveNewElement={saveNewElement}
          isSticky={isSticky}
          onBack={handleBackToTree}
        />
      );
    }
  };

  return (
    <div className="console">
      <div className="top-bar">
        <div className="inbox-buttons-container">
          {inboxElements.map((item) => (
            <Button
              key={item.elementId}
              variant="outlined"
              size="small"
              className={`inbox-shortcut-btn ${selectedElement?.elementId === item.elementId ? "active" : ""}`}
              onClick={() => handleInboxClick(item.elementId)}
            >
              {item.inboxName}
            </Button>
          ))}
        </div>
        <div className="top-bar-right">
          <Button
            variant="contained"
            size="small"
            onClick={signInWithGoogle}
            className="login-btn"
          >
            fLogin
          </Button>
        </div>
      </div>

      <div className={`console-layout ${mobileView === "details" ? "show-details" : "show-tree"}`}>
        <div className="tree-column">
          <DndProvider backend={HTML5Backend}>
            <StructureTree
              list={list}
              nodeSelect={nodeSelect}
              selectedElement={selectedElement}
              expanded={expandedNodes}
              onToggle={handleNodeToggle}
              finishAction={finishItemById}
              unDoneAction={unDoneElementById}
              addAction={addElement}
              removeAction={removeElementFromTheTree}
              changeParentAction={changeParent}
            />
          </DndProvider>
        </div>

        <div className="details-column">
          <div className={`${isSticky ? "sticky-wrapper sticky" : ""}`} ref={ref}>
            {(selectedElement || newElement) ? (
              renderItemDetails()
            ) : (
              <div className="select-placeholder">Select a task from the tree to view details</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
