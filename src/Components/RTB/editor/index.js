import React, { useReducer, useRef } from 'react'

import Field from '../molecules/field'
import { Global, ThemeProvider } from '@emotion/react'
import { globalStyle, theme } from '../utils/theme.config'
import FormLinker from 'form-linker'


const Editor = (props) => {

    const [_, forceUpdate] = useReducer(x => x + 1, 0)

    const demoContent = `pdawel`;


    const formLinker = useRef(new FormLinker({
        data: {
            editor: demoContent,
        },
        schema: {
            editor: "string",
        }
    }))

    debugger;
    return (
        <ThemeProvider theme={theme}>
            <Field
                formLinker={formLinker.current}
                name="editor"
                type="editor"

                onChange={forceUpdate} />
        </ThemeProvider>
    )
}

export default Editor