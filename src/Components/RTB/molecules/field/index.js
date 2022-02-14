import Input from '../../atoms/input'
import RichEditor from '../../organisms/richEditor';

const Field = ({ setRef = () => { }, formLinker, ...props }) => {
    debugger;
    const handleChange = value => {
        if (props.inputDisabled) {
            return null;
        }
        formLinker.setValue(props.name, value);

        props.onChange(value);
    };

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