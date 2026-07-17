import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const InvestigationService = {
  getProcesses: async () => {
    const response = await apiClient.get('/processes/');
    return response.data;
  },
  getProcessDetails: async (pid: number) => {
    const response = await apiClient.get(`/processes/${pid}/`);
    return response.data;
  },
  getNetworkConnections: async () => {
    const response = await apiClient.get('/network/');
    return response.data;
  },
  getSystemInfo: async () => {
    const response = await apiClient.get('/system/');
    return response.data;
  },
  getServices: async () => {
    const response = await apiClient.get('/services/');
    return response.data;
  },
  getUsers: async () => {
    const response = await apiClient.get('/users/');
    return response.data;
  }
};
