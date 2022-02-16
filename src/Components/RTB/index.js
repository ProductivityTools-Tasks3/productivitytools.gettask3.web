
import Field from './molecules/field'
import FormLinker from 'form-linker'

import React, { useReducer, useState, useRef, useEffect } from 'react'


import iconLibrary from './utils/iconLIbrary'
import english from './utils/translations/en'
// import Head from 'next/head'
import Translator from 'simple-translator'
import { globalStyle, theme } from './utils/theme.config'
import { jsx, Global, ThemeProvider } from '@emotion/react'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS
config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above


const Editor = (props) => {

    const reducer = (state, action) => {
        console.log(action)
        props.onChange(action);
    }

     const [_, forceUpdate] = useReducer(reducer, 0)
    //const [_, forceUpdate] = useReducer(x => x + 1, 0)


    // useEffect(() => {
    //     debugger;
    //     console.log("force update!!!!");

    //     formLinker.current.setValue("editor",props.content,true,true);        
    // }, [props.content])

    // const forceUpdate = (value) => {
    //     console.log("force udpate");
    //     props.onChange(value);
    // }

    const formLinker = useRef(new FormLinker({
        data: {
            editor: props.content,
        },
        schema: {
            editor: "string",
        }
    }))

    // const do1= () => {
    //     debugger;
    //     formLinker.current.setValue("editor","zzz",true,true);        
    //     //formLinker.forceUpdate();
    //     //Field.forceUpdate();
    //     //Field.formLinker.setValue("editor","fdsafdsa");
    // }

    iconLibrary()
    Translator.registerDefaultLanguage("en", english)

    return (
        <div>
            <ThemeProvider theme={theme}>
                <Global styles={globalStyle} />

                <Field
                    formLinker={formLinker.current}
                    name="editor"
                    type="editor"
                    minHeight={150}
                    height={320}
                    maxHeight={800}
                    placeholder="Enter your content here"
                    toolbar={['withImages']}
                    onChange={forceUpdate}
                    content={props.content}
                />
            </ThemeProvider>
            <p>{formLinker.current.data.editor}</p>
            <p>{props.content}</p>
            {/* <button onClick={do1}>ddd</button> */}
        </div >
    )
}

export default Editor