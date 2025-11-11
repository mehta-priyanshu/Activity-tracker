import axios from "axios";

const API = axios.create({
  baseURL: 
  window.location.hostname === "localhost"
  ?"http://localhost:5005/api"
  :`${process.env.REACT_APP_BACKEND_URL}/api`, // backend URL
});

// Automatically add token to headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token"); // ✅ must match exactly
  if (token) { 
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;