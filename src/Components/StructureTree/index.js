
import React, { Component, useEffect, useState } from 'react'
import apiService from '../../services/apiService';

export default function StructureTree() {

    const [list, setList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const r = await apiService.GetTree();
            console.log(r);
            setList(r);
        }
        fetchData();
    });

    return (<div>
        <div>pawel</div>
        <div>{list}</div>
    </div>)
}