import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React, { useState, useCallback, useEffect } from "react";
import Moment from 'react-moment';


import apiService from '../../services/apiService';
import SlateEditor from '../SlateEditor';


export default function ItemDetails(props) {

    const dateFormat = "YYYY-MM-DD HH:MM:SS";
    const [details, setDetails] = useState({});



    const handleChange = (e, o) => {

        // console.log("Item detials handle change");
        // console.log(e);
        // console.log(o);
        // console.log(e.target.value);
        // console.log(e.target.name);
        props.onChange(e.target.name, e.target.value);
    }

    const detailsChanged = (value) => {
        setDetails(value);
    }

    const updateElement = async () => {
        let jsonDetails = JSON.stringify(details)
        if (props.selectedElement.elementId === null) {
            let newId = await apiService.addElement(props.selectedElement.parentId, props.selectedElement.name, jsonDetails);
            props.saveNewElement(newId, jsonDetails);
        }
        else {
            apiService.updateElement(props.selectedElement.parentId, props.selectedElement.elementId, props.selectedElement.name, jsonDetails);
        }
    }

    const startElement = (e) => {
        props.onChange("status", "InProgress");
        apiService.start(props.selectedElement.elementId);
    }

    const taskNameChanged = (value) => {
        props.onChange('name', value);
    }

    console.log("rendering item details");
    console.log(props.selectedElement);
    if (props.selectedElement != null) {
        return (<div className='itemDetails sticky-inner'>
            <Stack spacing={2} direction="row">
                <Button variant={`${props.finishAction ? 'contained' : 'disabled'}`} onClick={props.finishAction}>Finish</Button>
                <Button variant={`${props.unDoneAction ? 'contained' : 'disabled'}`} onClick={props.unDoneAction}>Undone</Button>
                <Button variant="contained" onClick={updateElement}>Save</Button>
                <Button variant={`${props.finishAction ? 'contained' : 'disabled'}`} onClick={startElement}>Start</Button>
            </Stack>

            <p><span>Name: </span><input type="text" name="name" value={props.selectedElement.name} onChange={handleChange} style={{ width: "90%" }} ></input></p>
            <p><span>Status: </span><span>{props.selectedElement.status}</span></p>
            <SlateEditor selectedElement={props.selectedElement} detailsChanged={detailsChanged} taskNameChanged={taskNameChanged}></SlateEditor>



            <p><span>Created: </span><span><Moment format={dateFormat}>{props.selectedElement.created}</Moment></span></p>
            <p><span>Started: </span><span><Moment format={dateFormat}>{props.selectedElement.started}</Moment></span></p>
            <p><span>Finished: </span><span><Moment format={dateFormat}> {props.selectedElement.finished}</Moment></span></p>
            <hr />
            <p><span>ElementId: </span><span>{props.selectedElement.elementId}</span></p>
            <p><span>ParentId: </span><span>{props.selectedElement.parentId}</span></p>
            <p><span>Details: </span><textarea name="details" value={props.selectedElement.details == null ? "" : props.selectedElement.details} onChange={handleChange} style={{ width: "90%" }} ></textarea></p>
            <p><span>Amout of child elements: </span><span>{props.selectedElement.elements.length}</span></p>

            <p>{props.isSticky ? "sticky - glue to top" : "notsticy - not glue to top"}</p>



        </div >)
    }
    else {
        return <div>empty</div>
    }
}