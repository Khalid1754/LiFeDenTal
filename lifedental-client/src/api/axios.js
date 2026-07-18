import axios from 'axios'

const api = axios.create({
  baseURL: 'https://localhost:5001/api',
  withCredentials: true, // Skickar cookie automatiskt
})

export default api