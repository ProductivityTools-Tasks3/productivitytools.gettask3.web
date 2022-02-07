import { Button } from "@material-ui/core";
import Stack from '@mui/material/Stack';
import React from "react";
import Moment from 'react-moment';

import apiService from '../../services/apiService';


export default function ItemDetails(props) {

    const dateFormat = "YYYY-MM-DD HH:MM:SS";

    const handleChange = (e, o) => {

        // console.log("Item detials handle change");
        // console.log(e);
        // console.log(o);
        // console.log(e.target.value);
        // console.log(e.target.name);
        props.onChange(e.target.name, e.target.value);
    }

    const updateElement = () => {
        if (props.selectedElement.elementId === null) {
            apiService.addElement(props.selectedElement.parentId, props.selectedElement.name)
        }
        else {
            apiService.updateElement(props.selectedElement.parentId, props.selectedElement.elementId, props.selectedElement.name);
        }
    }

    if (props.selectedElement != null) {
        return (<div className='itemDetails sticky-inner'>
            <p><span>ElementId: </span><span>{props.selectedElement.elementId}</span></p>
            <p><span>ParentId: </span><span>{props.selectedElement.parentId}</span></p>

            <p><span>Name: </span><input type="text" name="name" value={props.selectedElement.name} onChange={handleChange} style={{ width: "90%" }} ></input></p>
            <p><span>Status: </span><span>{props.selectedElement.status}</span></p>
            <p><span>Created: </span><span><Moment format={dateFormat}>{props.selectedElement.created}</Moment></span></p>
            <p><span>Started: </span><span><Moment format={dateFormat}>{props.selectedElement.started}</Moment></span></p>
            <p><span>Finished: </span><span><Moment> format={dateFormat}>{props.selectedElement.finished}</Moment></span></p>
            <p><span>Amout of child elements: </span><span>{props.selectedElement.elements.length}</span></p>

            <p>{props.isSticky?"sticky":"notsticy"}</p>

            <Stack spacing={2} direction="row">
                <Button variant="contained" color="success" onClick={props.finishAction}>Finish</Button>
                <Button variant="contained" onClick={props.unDoneAction}>Undone</Button>
                <Button variant="contained" onClick={updateElement}>Save</Button>

            </Stack>
            
        </div>)
    }
    else {
        return <div>empty</div>
    }
}