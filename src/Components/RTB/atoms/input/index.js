import React from 'react'
import Style from './input.style';


const Input = React.forwardRef((props, ref) => {

    function change(e) {
        props.onChange(e.target.value);
    }

    function type() {
        if (['number', 'password', 'hidden'].includes(props.type)) {
            return props.type;
        } else {
            return 'text';
        }
    }

    const classes = [
        'input',
        `input-name-${props.name}`,
        `size-${props.size}`,
        props.error && 'error',
        props.type === 'currency' && 'currency',
    ]
        .filter(Boolean)
        .join(' ');

    const inputProps = {
        disabled: props.disabled,
        hidden: props.type === 'hidden',
        id: props.name,
        maxLength: props.maxLength,
        name: props.name,
        onBlur: props.onBlur,
        onChange: change,
        onFocus: props.onFocus,
        onKeyDown: props.onKeyDown,
        placeholder: props.placeholder,
        type: type(),
        value: props.value ?? '',
        autoComplete: props.autoComplete,
    };


    return <Style className={classes} {...inputProps} ref={ref} />
});

export default Input;