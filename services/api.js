import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.6.29:5000/api', // replace with your IP address or deployed backend URL
});

export default api;
