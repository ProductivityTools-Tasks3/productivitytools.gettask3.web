import { insertLink } from '../Utils/link.js'
import Button from '../button.js'
import Icon from '../icon.js'
import {isBlockActive} from '../slateUtilityFunctions.js'
const LinkButton = (props)=>{
    const {editor} = props
    const handleInsertLink = ()=>{
        const url = prompt('Enter URL');
        insertLink(editor,url)
    }
    return (
        <Button active={isBlockActive(editor,'link')} format={'link'} onClick={handleInsertLink}>
            <Icon icon='link'/>
        </Button>
    )
}


export default LinkButton;