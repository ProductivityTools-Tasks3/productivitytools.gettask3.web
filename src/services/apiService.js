import axios from 'axios'
import { AuthService } from './authService.js'

async function getDate() {
    const response = await axios.post('http://localhost:5513/api/Task/Date')
    return response.data;
}

async function GetTree() {

    let call = async (header) => {
        const data = { ElementId: null, Path: '' }
        const response = await axios.post('http://localhost:5513/api/Task/TodayList', data, header);
        return response.data;
    }
    return await callAuthorizedEndpoint(call);

    // const data = { ElementId: null, Path: '' }
    // const response = await axios.post('http://localhost:5513/api/Task/TodayList', data);
    // return response.data;
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
        else{
            console.log("user not in the storage, cannot perform authorized call, trying normal call");
            return await call();
        }
    })
}

export default {
    getDate,
    GetTree
}