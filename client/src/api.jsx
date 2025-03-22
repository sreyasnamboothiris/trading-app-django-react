import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/'
const WS_URL = 'ws://127.0.0.1:8000/ws/'

const api = axios.create({
    baseURL: API_URL,
    headers:{
        'Content-Type': 'application/json',
    }
})

const ws = new WebSocket(WS_URL)

export {ws}
export default api;

