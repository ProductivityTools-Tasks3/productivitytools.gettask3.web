
import React, { Component, useEffect, useState, useRef } from 'react'
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Collapse from '@material-ui/core/Collapse';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';



import ContextMenu from '../ContextMenu';
import { FOCUSABLE_SELECTOR } from '@testing-library/user-event/dist/utils';


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

const itemChecked=(status)=>{
    if (status=='Finished')
    {
        return true;
    }
    else
    {
        return false;
    }
}

const StyledTreeItem = (props) => {
    const {status, labelText } = props;
    return (<TreeItem {...props} label={
        <Box>
            <Checkbox checked={itemChecked(status)}/>
            {status}
            {labelText}
        </Box>
    } ></TreeItem>);
}

export default function StructureTree(props) {

    const [expanded, setExpanded] = useState([]);
    const containerRef = useRef(null);


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
                console.log(x);
                return (
                    <StyledTreeItem nodeId={x.elementId.toString()} key={x.elementId} labelText={x.name} status={x.status}>
                        {GetNode(x.elements)}
                    </StyledTreeItem>
                )
            })
            )
        }
    }

    function nodeSelect(e, id) {
        console.log(id);
        props.nodeSelect(id);
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
    if (props && props.list && props.list.elements)
    {
    return (
        <div ref={containerRef} className='structureTree' >
            <p>treeview below</p>
            <TreeView
                defaultCollapseIcon={<MinusSquare />}
                defaultExpandIcon={<PlusSquare />}
                defaultEndIcon={<CloseSquare />}
                onNodeToggle={handleToggle}
                expanded={expanded}
                onNodeToggle={handleToggle}
                onNodeSelect={nodeSelect}
                className="tree"

            >
                {GetNode(props.list.elements)}
            </TreeView>
            <ContextMenu parentRef={containerRef} items={menuItems} />

        </div>)
    }
    else
    {
        return (<div>still nothing</div>)
    }
}