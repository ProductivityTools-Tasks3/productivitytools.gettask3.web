import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React, { useState, useCallback, useEffect, useMemo } from "react";
import Moment from 'react-moment';
import './Editor.css'
import { Element } from './Parts/Element.js'
import { Leaf } from './Parts/Leaf.js'




import { Slate, Editable, withReact } from 'slate-react'
import { createEditor } from 'slate'

import Toolbar from './Toolbar'
import { autocompleteClasses } from '@mui/material';



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

    //Saving above

    const renderElement = useCallback(props => <Element {...props} />, [])

    const renderLeaf = useCallback(props => {
        return <Leaf {...props} />
    }, [])

    return (
        <div>
            <div style={{ width: '95%', margin:'0 auto' }}>
                <Slate editor={editor} value={value} onChange={newValue => { setValue(newValue); props.detailsChanged(newValue) }}>
                    <Toolbar />

                    <div className="editor-wrapper" style={{ border: '1px solid #f3f3f3', padding: '0 10px' }}>
                        <Editable
                            placeholder='Write something'
                            renderElement={renderElement}
                            renderLeaf={renderLeaf}
                        />
                    </div>
                </Slate>
            </div>
        </div>
    )
}