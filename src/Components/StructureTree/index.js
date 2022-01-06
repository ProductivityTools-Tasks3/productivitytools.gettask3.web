
import React, { Component, useEffect, useState, useRef } from 'react'
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Collapse from '@material-ui/core/Collapse';

import ContextMenu from '../ContextMenu';

import apiService from '../../services/apiService';

function PlusSquare(props) {
    return (
        <span>+</span>
    );
}


function MinusSquare(props) {
    return (
        <span>+</span>
    );
}


function CloseSquare(props) {
    return (
        <span>.</span>
    );
}

export default function StructureTree(props) {

    const [list, setList] = useState([]);
    const [expanded, setExpanded] = useState([]);
    const containerRef = useRef(null);

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

    const handleToggle = (event, nodeIds) => {
        console.log('handletoggle');
        console.log(nodeIds);
        setExpanded(nodeIds);
    };

    function getLabel(x) {
        let l = x.name + " [Id:" + x.id + "]";
        return l;
    }

    const treeClick = (e, treeId) => {
        e.stopPropagation();
        props.setSelectedTreeNode(treeId);
    }


    function GetNode(nodes) {
        if (nodes !== undefined) {
            return (nodes.map(x => {
                return (
                    <TreeItem nodeId={x.elementId.toString()} key={x.elementId} label={x.name}>
                        {GetNode(x.elements)}
                    </TreeItem>
                )
            })
            )
        }
    }


    const menuItems = [
        {
            text: 'Add new journal item',
            onclick: (treeId) => { props.setSelectedTreeNode(treeId); console.log(`Item one from container  ${treeId} clicked`); }
        },
        {
            text: 'Add new tree item',
            onclick: (treeId) => { props.setSelectedTreeNode(treeId); }
        },
        {
            text: 'Delete',
            onclick: (treeId) => { props.setSelectedTreeNode(treeId); }
        }
    ];

    return (
        <div ref={containerRef}>
            <p>treeview below</p>
            <TreeView
                defaultCollapseIcon={<MinusSquare />}
                defaultExpandIcon={<PlusSquare />}
                defaultEndIcon={<CloseSquare />}
                onNodeToggle={handleToggle}
                expanded={expanded}
                onNodeToggle={handleToggle}
                className="tree"

            >
                <TreeItem key="22" nodeId="22" label="22"></TreeItem>
                {list && list.elements && list.elements.map(x => {
                    return (<TreeItem key={x.elementId} nodeId={x.elementId.toString()} label={x.name}>{GetNode(x.elements)}</TreeItem>)
                })}
            </TreeView>
            <ContextMenu parentRef={containerRef} items={menuItems} />

        </div>)
}