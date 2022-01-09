import React, { useEffect, useState, } from 'react';

import apiService from '../../services/apiService';


import StructureTree from '../StructureTree'
import ItemDetails from '../ItemDetails';

export default function Console() {

    const [list, setList] = useState([]);
    const [selectedNode, setSelectedNode] = useState(-1);

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
        //debugger;
        console.log("findelement");
        var candidateElementId = candidateElement.elementId.toString();
        console.log(candidateElement.elementId);
        console.log(candidateElementId);
        if (candidateElementId == nodeId) {
            console.log("firstelement");
            return candidateElement;
        } else {
            for (var i = 0; i < candidateElement.elements.length; i += 1) {
                console.log("for invoked");
                var newCandidateElement = candidateElement.elements[i];
                var result = findElement(newCandidateElement, nodeId);
                if (result != null) {
                    console.log("find result");
                    return result;
                }
            }
        }
    }

    function nodeSelect(nodeId) {
        console.log(list);
        var selectedElement = findElement(list, nodeId);
        console.log("selectedelement")
        console.log(selectedElement);
        setSelectedNode(nodeId)
    }

    return (
        <div>
            <p>Console</p>
            <StructureTree list={list} nodeSelect={nodeSelect} />
            <ItemDetails />
            <p>{selectedNode}</p>
        </div>
    )
}
