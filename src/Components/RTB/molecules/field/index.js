import Input from '../../atoms/input'

const Field = (props) => {

    const renderInput = () => {
        switch (props.type) {
            case 'checkbox':
                return (<div>code missing</div>)
            case 'text':
                return (<div>code missing</div>)
            case 'editor':
                return (<div>code missing</div>)
            default:
                return <Input {...props} />
        }
    }
    return (<div>
        {renderInput()}
    </div>)
}

export default Field