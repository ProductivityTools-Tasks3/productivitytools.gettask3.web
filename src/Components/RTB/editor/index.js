import Field from '../molecules/field'
import { Global, ThemeProvider } from '@emotion/react'
import { globalStyle, theme } from '../utils/theme.config'

const Editor = (props) => {
    return (
        <ThemeProvider theme={theme}>
            <Field name="editor" />
        </ThemeProvider>
    )
}

export default Editor