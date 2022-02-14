import React, { useReducer, useRef } from 'react'

import Field from '../molecules/field'
import { Global, ThemeProvider } from '@emotion/react'
import { globalStyle, theme } from '../utils/theme.config'
import FormLinker from 'form-linker'
import iconLibrary from '../utils/iconLIbrary'
import Translator from 'simple-translator'
import english from '../utils/translations/en'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS


config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above


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

    
    iconLibrary()
    Translator.registerDefaultLanguage("en", english)

    return (
        <ThemeProvider theme={theme}>
            <Global styles={globalStyle} />

            <Field
                  formLinker={formLinker.current}
                  name="editor"
                  type="editor"
                  minHeight={150}
                  height={620}
                  maxHeight={800}
                  placeholder="Enter your content here"
                  toolbar={['withImages']}
                  onChange={forceUpdate}
                  />
        </ThemeProvider>
    )
}

export default Editor