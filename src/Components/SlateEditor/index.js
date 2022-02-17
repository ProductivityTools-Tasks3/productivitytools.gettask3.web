import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React, { useState, useCallback, useEffect, useMemo } from "react";
import Moment from 'react-moment';
import './Editor.css'



import { Slate, Editable, withReact } from 'slate-react'
import { createEditor } from 'slate'

import Toolbar from './Toolbar'

export default function SlateEditor(props) {

    const editor = useMemo(() => withReact(createEditor()), [])
    const [value, setValue] = useState([{
        type: 'paragraph',
        children: [{ text: 'empty' }],
    },])
    const [number, setNumber] = useState([])


    useEffect(() => {
        debugger;
        let x = new Date().getMilliseconds().toString();
        setNumber(x);
        let details = props.selectedElement?.details;
        let detailsType = props.selectedElement?.detailsType;
        let template = [{
            type: 'paragraph',
            children: [{ text: details || "No data" }],
        },]

        let newValue = detailsType == 'Slate' ? JSON.parse(details) : template

        editor.children = newValue;
        setValue(newValue)


    }, [props.selectedElement.elementId])


    return (
        <div>
            <Slate editor={editor} value={value} onChange={newValue => { setValue(newValue); props.detailsChanged(newValue) }}>
                <Toolbar />
                <Editable />
            </Slate>
            <p>raw:</p>
            <p>{props.details}</p>
            <p>number:</p>
            <p>{number}</p>
        </div>
    )
}