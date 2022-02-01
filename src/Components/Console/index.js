import React, { useEffect, useState, useRef } from 'react';

import apiService from '../../services/apiService';


import StructureTree from '../StructureTree'
import ItemDetails from '../ItemDetails';

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

export default function Console() {

    const [list, setList] = useState([]);
    const [selectedElement, setSelectedElement] = useState();

    const [isSticky, setSticky] = useState(false);
    const ref = useRef(null);
    const handleScroll = () => {
        if (ref.current) {
            setSticky(ref.current.getBoundingClientRect().top <= 0);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', () => handleScroll);
        };
    }, []);



    useEffect(() => {
        const fetchData = async () => {
            console.log("call apiservice");
            const r = await apiService.GetTree();
            console.log(r);
            setList(r);
        }
        fetchData();
        console.log("useeffect");
    }, []);

    function findElement(candidateElement, nodeId) {
        var candidateElementId = candidateElement.elementId.toString();
        console.log(candidateElement.elementId);
        console.log(candidateElementId);
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
        finishThisItem(selectedElement)
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
        console.log('undone')
        let element = findElement(list, elementId);
        unDoneThisElement(element);
    }

    function unDoneThisElement(elementToUpdate) {
        updateStatus(elementToUpdate, "New");
        apiService.unDone(elementToUpdate.elementId);
    }

    function nodeSelect(nodeId) {
        console.log(list);
        var se = findElement(list, nodeId);
        setSelectedElement(se);
    }

    function updateElement(propertyName, propertyValue) {
        console.log("Console update element");
        updateElementInList(selectedElement, propertyName, propertyValue);
        console.log(propertyName);
        console.log(propertyValue);
    }

    function changeParent(childId,newParentId){
        console.log("childId");
        console.log(childId);
        console.log("newParentId");
        console.log(parentId);
    }

    function addElement() {
        setSelectedElement({
            "name": "",
            "type": 2,
            "elementId": null,
            "parentId": selectedElement.elementId,
            "status": "New",
            "created": "2021-11-08T07:17:32.639432",
            "initialization": "2021-11-08T07:17:32.6394877",
            "started": "0001-01-01T00:00:00",
            "finished": null,
            "category": null,
            "elements": [],
            "tomatoes": []
        });
    }

    return (
        <div className='console'>
            <p>Console</p>
            <p>{selectedElement && selectedElement.elementId}</p>
            
            <DndProvider backend={HTML5Backend}> {/* drag and drop */}
                <StructureTree list={list} nodeSelect={nodeSelect} finishAction={finishItemById} unDoneAction={unDoneElementById} addAction={addElement} />
            </DndProvider>/
            <div className={`${isSticky ? 'sticky-wrapper sticky' : ''}`} ref={ref} >
                <ItemDetails selectedElement={selectedElement} finishAction={finishItem} unDoneAction={unDoneElement} onChange={updateElement} isSticky={isSticky} />
            </div>


        </div>
    )
}
