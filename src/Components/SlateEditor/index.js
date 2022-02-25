import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React, { useState, useCallback, useEffect, useMemo } from "react";
import Moment from 'react-moment';
import './Editor.css'
import { Element } from './Parts/Element.js'
import { Leaf } from './Parts/Leaf.js'
import {
    Transforms,
    createEditor,
    Text,
    Node,
    Editor,
    Element as SlateElement,
    Descendant,
} from 'slate'




import { Slate, Editable, withReact } from 'slate-react'
import Toolbar from './Toolbar'
import { autocompleteClasses } from '@mui/material';
import { useDebugValue } from 'react';


const withLayout = editor => {
    const { normalizeNode } = editor
    editor.normalizeNode = ([node, path]) => {
        if (editor.changingContent == true) return;
        debugger;
        if (path.length === 0) {
            if (editor.children.length < 1) {
                const title = {
                    type: 'title',
                    children: [{ text: 'Untitled' }],
                }
                Transforms.insertNodes(editor, title, { at: path.concat(0) })
            }

            if (editor.children.length < 2) {
                const paragraph = {
                    type: 'paragraph',
                    children: [{ text: '' }],
                }
                Transforms.insertNodes(editor, paragraph, { at: path.concat(1) })
            }

            for (const [child, childPath] of Node.children(editor, path)) {
                const slateIndex = childPath[0]

                if (slateIndex == 0) {

                    Transforms.setNodes(editor, { type: 'title' }, {
                        at: childPath,
                    })
                }
                if (slateIndex > 0 && child.type == 'title') {
                    Transforms.setNodes(editor, { type: 'paragraph' }, {
                        at: childPath,
                    })
                }
            }
        }

        return normalizeNode([node, path])
    }

    return editor
}

export default function SlateEditor(props) {

    //const editor = useMemo(() => withLayout(withReact(createEditor())), [])
    const editor = useMemo(() => withReact(createEditor()), [])
    const [value, setValue] = useState([{
        type: 'paragraph',
        children: [{ text: 'empty' }],
    },])
    const [title, setTitle] = useState('nothing');

    useEffect(() => {
        changeContent();
    }, [props.selectedElement.elementId])


    const getSlateStructureFromRawDetails = (rawDetails, title) => {
        let template = [{
            type: 'title',
            children: [{ text: title || "Title" }],
        }, {
            type: 'paragraph',
            children: [{ text: rawDetails || "No data" }],
        },]
        return template;
    }

    const checkIfDetailsContainsTitle = (detailsObject, title) => {
        let detailsTitle = detailsObject[0].children[0].text;
        if (detailsTitle != title) {
            detailsObject.unshift({
                type: 'paragraph',
                children: [{ text: title }],
            });
        }
        return detailsObject;
    }

    const changeContent = () => {

        editor.changingContent = true;
        let rawDetails = props.selectedElement?.details;
        let detailsType = props.selectedElement?.detailsType;
        let title = props.selectedElement.name;

        debugger;
        let newValue = ''
        if (detailsType == 'Slate') {
            let detailsObject = JSON.parse(rawDetails);
            if (detailsObject && Object.keys(detailsObject).length > 0 && Object.getPrototypeOf(detailsObject) != Object.prototype) {
                // let detailsTitle = detailsObject[0].children[0].text;
                // if (detailsTitle != title) {
                //     detailsObject=[{
                //         type: 'title',
                //         children: [{ text: title }],
                //     }].concat(detailsObject);
                // }
                newValue = detailsObject;

            }
            else {
                newValue = getSlateStructureFromRawDetails(rawDetails, title);
            }
        }
        else {
            debugger;
            newValue = getSlateStructureFromRawDetails(rawDetails, title);;
        }
        console.log("details");
        console.log(rawDetails);
        console.log("NewVAlue");
        console.log(newValue);
        let totalNodes = editor.children.length

        // No saved content, don't delete anything to prevent errors
        if (value.length <= 0) {
            return
        }



        // Remove every node except the last one
        // Otherwise SlateJS will return error as there's no content
        for (let i = 0; i < totalNodes - 1; i++) {
            console.log(i)
            Transforms.removeNodes(editor, {
                at: [i],
            })
        }
        // debugger;
        // let detailsTitle = newValue[0].children[0].text;
        // if (detailsTitle != title) {
        //     let newElement = {
        //         type: 'paragraph',
        //         children: [{ text: title }],
        //     }
        //     Transforms.insertNodes(editor, newElement, {
        //         at: [editor.children.length],
        //     })
        // }

        // Add content to SlateJS
        for (const v1 of newValue) {
            Transforms.insertNodes(editor, v1, {
                at: [editor.children.length],
            })
        }

        // Remove the last node that was leftover from before
        Transforms.removeNodes(editor, {
            at: [0],
        })
        editor.changingContent = false;
    }
    //Saving above

    const renderElement = useCallback(props => <Element {...props} />, [])

    const renderLeaf = useCallback(props => {
        return <Leaf {...props} />
    }, [])

    const editorChanged = (newValue) => {
        setValue(newValue);
        props.detailsChanged(newValue)
        let title=editor.children[0].children[0].text;
        setTitle(title);
        //props.titleChanged(title);
    }


    return (
        <div>
            <div style={{ width: '95%', margin: '0 auto' }}>
                <Slate editor={editor} value={value} onChange={editorChanged}>
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
            <div>{title}</div>
        </div>
    )
}