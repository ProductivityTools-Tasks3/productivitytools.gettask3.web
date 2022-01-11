import { Button } from "@material-ui/core";
import React from "react";
import apiService from "../../services/apiService";

export default function ItemDetails(props) {


    if (props.selectedElement!=null) {
        return (<div className='itemDetails'>Item details
            <p><span>ElementId: </span><span>{props.selectedElement.elementId}</span></p>
            <p><span>Name: </span><span>{props.selectedElement.name}</span></p>
            <p><span>Status: </span><span>{props.selectedElement.status}</span></p>
            <p><span>Created: </span><span>{props.selectedElement.created}</span></p>
            <p><span>Started: </span><span>{props.selectedElement.started}</span></p>
            <p><span>Finished: </span><span>{props.selectedElement.finished}</span></p>
            <p><span>Amout of child elements: </span><span>{props.selectedElement.elements.length}</span></p>
            <p><Button onClick={props.finishAction}>Finish</Button></p>
        </div>)
    }
    else
    {
        return <div>empty</div>
    }
}