import React, { useEffect, useState } from 'react'
import './index.css'

const ContextMenu = ({ parentRef, items }) => {

    const [isVisible, setIsVisible] = useState(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [selectedTreeId, setSelectedTreeId] = useState();

    useEffect(() => {
        const parent = parentRef.current;
        if (!parent) {
            return;
        }

        console.log(parentRef);

        const showMenu = (event) => {

            console.log(event);
            event.preventDefault();
            setIsVisible(true);
            setX(event.clientX);
            setY(event.clientY);
            console.log('show');
            console.log(event.path)
            let reversedArray = event.composedPath().reverse();
            let li = reversedArray.find(e => e.nodeName == 'LI' && e.className.includes('MuiTreeItem-root styledTreeItem'));
            //let id=li.attributes.find(e=>e.name='xxxx')
            console.log(li.getAttribute('elementId'));
            let elementId = event.composedPath().find(e => e.nodeName == 'LI' && e.className.includes('MuiTreeItem-root styledTreeItem')).getAttribute('elementId');
            
            setSelectedTreeId(parseInt(elementId));
            console.log("selectet tree id")
            console.log(elementId);
        }

        const closeMenu = () => {
            setIsVisible(false);
        }

        parent.addEventListener('contextmenu', showMenu);
        window.addEventListener('click', closeMenu);

        return function cleanup() {
            parent.removeEventListener('contextmenu', showMenu);
            parent.removeEventListener('click', closeMenu);
        }
    })

    const style = {
        top: y,
        left: x
    };


    return isVisible ? (
        <div className='context-menu' style={style}>
            {items.map((item, index) => {
                return (
                    <div key={index}
                        onClick={(e) => item.onclick(e, selectedTreeId)}
                        className='context-menuItem'>
                        {item.text}
                    </div>
                )
            })}
        </div>
    ) : null
}

export default ContextMenu;