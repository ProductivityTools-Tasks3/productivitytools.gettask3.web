import axios from 'axios'
import { config } from '../Consts';
import { AuthService } from './authService.js'
import { ToastContainer, toast } from 'react-toastify';
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


    let authService = new AuthService();
    return await authService.getUser().then(async user => {
        if (user && user.access_token) {
            const header = {
                headers: { Authorization: `Bearer ${user.access_token}` }
            };
            try {
                const result = await call(header);
                return result;
            }
            catch (error) {
                if (error.response != null && error.response.status === 401) {
                    console.log("try to renew token");
                    console.log("more code needed");
                }
            }
        }
        else {
            console.log("user not in the storage, cannot perform authorized call, trying normal call");
            return await call();
        }
    })
}

export default {
    getDate,
    GetTree,
    finish,
    unDone
}