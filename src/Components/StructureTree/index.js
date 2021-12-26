
import React, { Component, useEffect, useState } from 'react'
import apiService from '../../services/apiService';
import { AuthService } from '../../services/authService';

export default function StructureTree() {

    let authService = new AuthService();
    const [userAutenticated, setUserAuthenticated] = useState(false);
    const [list, setList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const r = await apiService.GetTree();
            console.log(r);
            setList(r);
        }
        if (userAutenticated) {
            fetchData();
        }
    }, []);

    const login = () => { };

    return (<div>
        <button onClick={login}></button>
        <div>pawel</div>
        <div>{list.name}</div>
        <div>{list && list.elements && list.elements.Length > 0 && list.elements.map(element => {
            return (<div>{element.name}</div>)
        })
        }</div>
    </div>)
}