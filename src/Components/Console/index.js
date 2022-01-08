import React,{ useEffect, useState, } from 'react';

import apiService from '../../services/apiService';


import StructureTree from '../StructureTree'
import ItemDetails from '../ItemDetails';

export default function Console() {

    const [list, setList] = useState([]);
    const [selectedNode,setSelectedNode]=useState(-1);

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

    function nodeSelect(nodeId){
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
