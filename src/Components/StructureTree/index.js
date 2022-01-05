
import React, { Component, useEffect, useState } from 'react'
import apiService from '../../services/apiService';
import { AuthService } from '../../services/authService';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Collapse from '@material-ui/core/Collapse';


function PlusSquare(props) {
    return (
     <span>+</span>
    );
  }

export default function StructureTree() {

    let authService = new AuthService();
    const [userAutenticated, setUserAuthenticated] = useState(false);
    const [list, setList] = useState([]);
    const [expanded, setExpanded] = useState([]);


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

    const handleToggle = (event, nodeIds) => {
        console.log('handletoggle');
        console.log(nodeIds);
        setExpanded(nodeIds);
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
            <TreeView
            defaultExpandIcon={<PlusSquare />}
            expanded={expanded}
            onNodeToggle={handleToggle}

            >
                <TreeItem key="1" nodeId='11' label="fda1">
                    <TreeItem key="2"  nodeId='22' label="fda2">dd2</TreeItem>
                </TreeItem>
                <TreeItem key="3" nodeId='33' label="fda3">dd2</TreeItem>
            </TreeView>
        </div>

    </div>)
}