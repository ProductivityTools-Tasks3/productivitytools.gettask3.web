import React, { useEffect, useState, } from 'react';

import apiService from '../../services/apiService';


import StructureTree from '../StructureTree'
import ItemDetails from '../ItemDetails';

export default function Console() {

    const [list, setList] = useState([]);
    const [selectedElement, setSelectedElement] = useState();

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

    function updateStatus(newStatus) {
        setSelectedElement({ ...selectedElement, status: newStatus });

        let newList = list;
        let newElement = findElement(newList, selectedElement.elementId);
        newElement.status = newStatus;
        setList(newList);
    }

    function finishItem() {
        updateStatus("Finished");
    }

    function unDoneElement() {
        updateStatus("New");
    }

    function nodeSelect(nodeId) {
        console.log(list);
        var se = findElement(list, nodeId);
        setSelectedElement(se);
    }

    return (
        <div className='console'>
            <p>Console</p>
            <StructureTree list={list} nodeSelect={nodeSelect} />
            <ItemDetails selectedElement={selectedElement} finishAction={finishItem} unDoneAction={unDoneElement} />
            <p>{selectedElement && selectedElement.elementId}</p>
        </div>
    )
}
