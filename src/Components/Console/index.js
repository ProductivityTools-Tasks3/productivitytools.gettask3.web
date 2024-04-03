import React, { useEffect, useState, useRef } from "react";

import apiService from "../../services/apiService";

import StructureTree from "../StructureTree";
import ItemDetails from "../ItemDetails";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function Console() {
  const [list, setList] = useState([]);
  const [selectedElement, setSelectedElement] = useState();
  const [newElement, setNewElement] = useState(null);

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
    setSelectedElement({ ...elementToUpdate, status: newStatus });

    let newList = list;
    let newElement = findElement(newList, elementToUpdate.elementId);
    newElement.status = newStatus;
    setList(newList);
  }

  function updateElementInList(elementToUpdate, propertyName, propertyValue) {
    setSelectedElement({ ...elementToUpdate, [propertyName]: propertyValue });
    let newList = list;
    let newElement = findElement(newList, elementToUpdate.elementId);
    newElement[propertyName] = propertyValue;
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

  function nodeSelect(nodeId) {
    // console.log(list);
    var se = findElement(list, nodeId);
    console.log("Set selected element", se);
    setSelectedElement(se);
  }

  function updateElement(propertyName, propertyValue) {
    console.log("Console update element" + propertyName);
    updateElementInList(selectedElement, propertyName, propertyValue);
    // console.log(propertyName);
    // console.log(propertyValue);
  }

  function changeParent(child, newParentId) {
    // console.log("childId");
    // console.log(childId);
    // console.log("newParentId");
    // console.log(newParentId);
    var childobject = findElement(list, child.elementId);
    var currentparent = findElement(list, child.parentId);
    currentparent.elements = currentparent.elements.filter((item) => item !== childobject);
    var parentobject = findElement(list, newParentId);
    parentobject.elements.push(childobject);
    updateElementInList(child, "parentId", newParentId);
    apiService.moveElement(child.elementId, newParentId);
  }

  // const updateSelectedElementId = (id) => {
  //     let updatedElement = { ...selectedElement, elementId: 1 };
  //     debugger;
  //     console.log(updatedElement);
  //     setSelectedElement(updatedElement, addElementToTree);
  //     console.log(selectedElement)
  // }

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
  }

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
        />
      );
    } else {
      return (
        <ItemDetails
          selectedElement={newElement}
          onChange={updateNewElement}
          saveNewElement={saveNewElement}
          isSticky={isSticky}
        />
      );
    }
  };

  return (
    <div className="console">
      <p>Console</p>
      <p>{newElement && newElement.details}</p>

      <p>{selectedElement && selectedElement.elementId}</p>

      <DndProvider backend={HTML5Backend}>
        {" "}
        {/* drag and drop */}
        <StructureTree
          list={list}
          nodeSelect={nodeSelect}
          selectedElement={selectedElement}
          finishAction={finishItemById}
          unDoneAction={unDoneElementById}
          addAction={addElement}
          removeAction={removeElementFromTheTree}
          changeParentAction={changeParent}
        />
      </DndProvider>
      <div className={`${isSticky ? "sticky-wrapper sticky" : ""}`} ref={ref}>
        {selectedElement && renderItemDetails()}
      </div>
    </div>
  );
}
