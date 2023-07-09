import axios from 'axios'
import { config } from '../Consts';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

async function getDate() {
    const response = await axios.post(`${config.PATH_BASE}Task/Date`)
    return response.data;
}

async function GetTree() {

    let call = async (header) => {
        const data = { ElementId: null, Path: '' }
        const response = await axios.post(`${config.PATH_BASE}Task/TodayList`, data, header);
        return response.data;
    }
    return await callAuthorizedEndpointWithToast(call, "Request for a task tree", "Task tree received!");

    // const data = { ElementId: null, Path: '' }
    // const response = await axios.post('http://localhost:5513/api/Task/TodayList', data);
    // return response.data;
}

async function finish(elementId) {
    let call = async (header) => {
        const data = { ElementId: elementId }
        const response = await axios.post(`${config.PATH_BASE}Task/Finish`, data, header);
        return response.data;
    }
    return await callAuthorizedEndpointWithToast(call, "Request to set task to finished", "Task set to finished on the server");
}

async function unDone(elementId) {
    let call = async (header) => {
        const data = { ElementId: elementId };
        const response = await axios.post(`${config.PATH_BASE}Task/Undone`, data, header);
        return response.data;
    }

    return await callAuthorizedEndpointWithToast(call, "Request for set task to acctive", "Task set to active on the server")
}

async function start(elementId) {
    let call = async (header) => {
        const data = { ElementId: elementId };
        const response = await axios.post(`${config.PATH_BASE}Task/Start`, data, header);
        return response.data;
    }

    return await callAuthorizedEndpointWithToast(call, "Request for start task", "Task started on the server")
}


async function addElement(parentId, value, details) {
    debugger;
    console.log("update element");
    console.log(value);
    let call = async (header) => {
        const data = { ParentId: parentId, Name: value, Details: details, DetailsType: 'Slate', Finished: false };
        const response = await axios.post(`${config.PATH_BASE}Task/Add`, data, header)
        return response.data;
    }
    return await callAuthorizedEndpointWithToast(call, "Request create element", "Element created");
}

async function updateElement(parentId, elementId, value, details) {
    console.log("update element");
    console.log(value);
    let call = async (header) => {
        const data = { ParentId: parentId, ElementId: elementId, Name: value, Details: details, DetailsType: 'Slate' };
        const response = await axios.post(`${config.PATH_BASE}Task/Update`, data, header)
        return response.data;
    }
    return await callAuthorizedEndpointWithToast(call, "Request to update element", "Element updated");
}

async function moveElement(elementId, targetParentId) {
    let call = async (header) => {
        const data = { ElementIds: [elementId], Target: targetParentId }
        const response = await axios.post(`${config.PATH_BASE}Task/Move`, data, header)
        return response.data;
    }
    return await callAuthorizedEndpointWithToast(call, "Request to move element", "Element moved");
}

async function callAuthorizedEndpointWithToast(call, pendingMessage, successMessage) {
    return toast.promise(
        callAuthorizedEndpoint(call),
        {
            pending: pendingMessage ? pendingMessage : "Missing pending message",
            success: successMessage ? successMessage : "Missing sucesss message",
            error: 'something happned!!!!'
        }
    )
}

async function callAuthorizedEndpoint(call) {
    let token = localStorage.getItem('token')
    //console.log("token from localstorage", token)
    const header = { headers: { Authorization: `Bearer ${token}` } }
    try {
        const response = call(header);
        return response;
    } catch (error) {
        console.log("Call endpoint");
        console.log(error);
    }
}

const service= {
    getDate,
    GetTree,
    finish,
    unDone,
    updateElement,
    addElement,
    moveElement,
    start
}

export default service