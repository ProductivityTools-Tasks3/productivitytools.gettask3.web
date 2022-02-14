import Input from '../../atoms/input'
import RichEditor from '../../organisms/richEditor';
import React, { useCallback, useEffect, useReducer, useRef } from 'react';

const reducer = (state, action = false) => {
    if (action) {
      return 'setValues';
    } else return ++state > 0 ? state : 0;
  };

const Field = ({ setRef = () => { }, formLinker, ...props }) => {
    const inputRef = useRef();
    const [state, forceUpdate] = useReducer(reducer, 0);

    debugger;
    const handleChange = value => {
        if (props.inputDisabled) {
            return null;
        }
        formLinker.setValue(props.name, value);

        props.onChange(value);
    };

    const setRefFn = useCallback(
        el => {
          if (el !== null) {
            inputRef.current = el;
            setRef(el);
            formLinker.setRef(props.name, { forceUpdate, inputRef });
          }
        },
        [formLinker, props.name, setRef]
      );

    debugger;
    const renderInput = () => {
        const commonProps = {
            // onBlur: handleBlur, pw
            onChange: handleChange,
            // onFocus: handleFocus, pw
            value: formLinker.getValue(props.name),
            //error: formLinker.getError(props.name) && !isEmpty(formLinker.getError(props.name)), 
        };

        switch (props.type) {
            case 'checkbox':
                return (<div>code missing1</div>)
            case 'text':
                return (<div>code missing2</div>)
            case 'editor':
                return <RichEditor {...props} {...commonProps} ref={setRefFn} formLinker={formLinker} />;
            default:
                return <Input {...props} {...commonProps} />
        }
    }
    return (<div>
        {renderInput()}
    </div>)
}

export default Field