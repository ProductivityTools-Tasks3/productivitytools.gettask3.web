import React, { useState } from 'react'
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function NewModal({ open, selectedTreeNode, closeAndRefresh, closeModal }) {

    console.log("Modal");
    console.log(selectedTreeNode);
    const [treeName, setTreeeName] = useState("");

    const addNewItem = function () {
        // apiService.addTreeNode(Number(selectedTreeNode.id), treeName);
        closeAndRefresh();
    }

    const journalNameChange = (e) => {
        setTreeeName(e.target.value);
    }

    const cancel = () => {
        closeModal();
    }



    return (<Modal open={open}>
        <Box sx={style}>
            <p><span>Adding new task to: </span><b>{selectedTreeNode?.name}</b></p>
            <TextField id="outlined-basic" label="Outlined" variant="outlined" onChange={journalNameChange} /><br />
            <Button variant="contained" color="primary" onClick={addNewItem}>Add</Button>
            <Button variant="outlined" color="primary" onClick={cancel}>Cancel</Button>

            <input type='text' value={treeName} onChange={journalNameChange} />
            <button onClick={addNewItem}>Add</button>
            <button onClick={cancel}>Cancel</button>
        </Box>
    </ Modal>)
}