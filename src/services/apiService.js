import axios from 'axios'

async function getDate(){
    const response=await axios.post('http://localhost:5513/api/Task/Date')
    return response.data;
}

async function GetTree(){
    const data = { ElementId: null, Path:'' }
    const response=await axios.post('http://localhost:5513/api/Task/TodayList',data);
    return response.data;
}

export default{
    getDate,
    GetTree
}