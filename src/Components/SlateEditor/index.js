import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React, { useState, useCallback, useEffect, useMemo } from "react";
import Moment from 'react-moment';

import { Slate, Editable, withReact } from 'slate-react'
import { createEditor } from 'slate'

export default function SlateEditor(props) {

    const editor = useMemo(() => withReact(createEditor()), [])
    const [value, setValue] = useState([{
        type: 'paragraph',
        children: [{ text: 'empty' }],
    },])
    const [number, setNumber] = useState([])


    useEffect(() => {
        let x = new Date().getMilliseconds().toString();
        setNumber(x);
        let newValue=[{
            type: 'paragraph',
            children: [{ text: props.selectedElement?.details || "No data" }],
        },]
        
        editor.children=newValue;
        setValue(newValue)


    }, [props.selectedElement.elementId])


    return (
        <div>
            <Slate
                editor={editor}
                value={value}
                onChange={newValue => {
                    setValue(newValue)
                }
                }>
                <Editable />
            </Slate>
            <p>raw:</p>
            <p>{props.details}</p>
            <p>number:</p>
            <p>{number}</p>
        </div>
    )
}