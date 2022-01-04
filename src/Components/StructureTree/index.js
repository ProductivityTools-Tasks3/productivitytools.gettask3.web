
import React, { Component, useEffect, useState } from 'react'
import apiService from '../../services/apiService';
import { AuthService } from '../../services/authService';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Collapse from '@material-ui/core/Collapse';

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
        <TreeView>
        <TreeItem label="fda">dd</TreeItem>
        <TreeItem label="fda">dd2</TreeItem>
        </TreeView>
        </div>

    </div>)
}