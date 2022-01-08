import React,{ useEffect, useState, } from 'react';

import apiService from '../../services/apiService';


import StructureTree from '../StructureTree'
import ItemDetails from '../ItemDetails';

export default function Console() {

    const [list, setList] = useState([]);

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


    return (
        <div>
            <p>Console</p>
            <StructureTree list={list} />
            <ItemDetails />
        </div>
    )
}
