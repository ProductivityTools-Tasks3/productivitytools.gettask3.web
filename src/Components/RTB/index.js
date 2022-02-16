
import Field from './molecules/field'
import FormLinker from 'form-linker'

import React, { useReducer, useState, useRef } from 'react'


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

    // const reducer = (state, action) => {
    //     console.log(action)
    //     props.onChange(action);
    // }

    // const [_, forceUpdate] = useReducer(reducer, 0)
    //const [_, forceUpdate] = useReducer(x => x + 1, 0)

    const forceUpdate = (value) => {
        console.log("force udpate");
        debugger;
        props.onChange(value);
    }

    const formLinker = useRef(new FormLinker({
        data: {
            editor: props.content,
        },
        schema: {
            editor: "string",
        },
    }))


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
                />
            </ThemeProvider>
            <p>{formLinker.current.data.editor}</p>
            <p>{props.content}</p>
        </div>
    )
}

export default Editor