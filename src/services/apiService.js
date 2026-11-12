import axios from 'axios'
import { config } from '../Consts';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuthToken, auth } from '../Session/firebase';

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

async function getLast7DaysTree(elementId = null) {
    let call = async (header) => {
        const data = { ElementId: elementId, Path: '' };
        const response = await axios.post(`${config.PATH_BASE}Task/Last7DaysList`, data, header);
        return response.data;
    };
    return await callAuthorizedEndpoint(call);
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


async function remove(elementId) {
    let call = async (header) => {
        const data = { ElementId: elementId };
        const response = await axios.post(`${config.PATH_BASE}Task/Remove`, data, header);
        return response.data;
    }

    return await callAuthorizedEndpointWithToast(call, "Request for delete task", "Task deleted on the server")
}


async function changeType(elementId, type) {
    let call = async (header) => {
        const data = { ElementId: elementId, Type:type };
        const response = await axios.post(`${config.PATH_BASE}Task/ChangeType`, data, header);
        return response.data;
    }

    return await callAuthorizedEndpointWithToast(call, "Request for changing type", "Type changed on the server")
}



async function addElement(parentId, value, details) {
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
    let token = await getAuthToken();
    const header = { headers: { Authorization: `Bearer ${token}` } };
    try {
        const response = await call(header);
        return response;
    } catch (error) {
        if (error?.response?.status === 401 && auth.currentUser) {
            console.log("401 Unauthorized received, force refreshing token...");
            try {
                const refreshedToken = await getAuthToken(true);
                const retryHeader = { headers: { Authorization: `Bearer ${refreshedToken}` } };
                return await call(retryHeader);
            } catch (retryError) {
                console.error("Retry after token refresh failed", retryError);
            }
        }
        console.log("Call endpoint error:", error);
        throw error;
    }
}

async function setInboxName(elementId, inboxName) {
    let call = async (header) => {
        const data = { ElementId: elementId, InboxName: inboxName };
        const response = await axios.post(`${config.PATH_BASE}Task/SetInboxName`, data, header);
        return response.data;
    }
    return await callAuthorizedEndpointWithToast(call, "Request to set inbox name", "Inbox name updated on the server");
}

async function clearInboxName(elementId) {
    let call = async (header) => {
        const data = { ElementId: elementId };
        const response = await axios.post(`${config.PATH_BASE}Task/ClearInboxName`, data, header);
        return response.data;
    }
    return await callAuthorizedEndpointWithToast(call, "Request to clear inbox name", "Inbox name cleared on the server");
}

const service= {
    getDate,
    GetTree,
    getLast7DaysTree,
    finish,
    remove,
    unDone,
    updateElement,
    addElement,
    moveElement,
    start,
    changeType,
    setInboxName,
    clearInboxName
}

export default service