
import React, { Component, useEffect, useState } from 'react'
import TreeView from '@mui/lab/TreeView';
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
        fetchData();

    }, []);

    const login = () => {
        authService.login();
    };


    const logout = () => {
        authService.logout();
    };

    return (<div>
        <button onClick={login}>Login</button>
        <button onClick={logout}>Logout</button>
        <div>pawel</div>
        <div>{list && list.name}</div>
        <div>{list && list.elements && list.elements.Length > 0 && list.elements.map(element => {
            return (<div>{element.name}</div>)
        })
        }
        <TreeView></TreeView>
        </div>

    </div>)
}