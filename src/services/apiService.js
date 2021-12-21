import axios from 'axios'

async function getDate(){
    const response=await axios.post('http://localhost:5513/api/Task/Date')
    return response.data;
}

export default{
    getDate
}