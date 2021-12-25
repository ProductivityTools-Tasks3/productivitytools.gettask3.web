
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
    }, []);

    return (<div>
        <div>pawel</div>
        <div>{list.name}</div>
        <div>{list && list.elements && list.elements.Length>0 && list.elements.map(element => {
            return (<div>{element.name}</div>)
        })
        }</div>
    </div>)
}