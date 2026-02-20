import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
  
  updateProfile: (userData) => 
    api.put('/auth/profile', userData),
};

// Job API calls
export const jobAPI = {
  getJobs: (params) => 
    api.get('/jobs', { params }),
  
  getJob: (id) => 
    api.get(`/jobs/${id}`),
  
  createJob: (jobData) =>
    api.post('/jobs', jobData),
  
  updateJob: (id, jobData) =>
    api.put(`/jobs/${id}`, jobData),
  
  deleteJob: (id) =>
    api.delete(`/jobs/${id}`),
};

// AI API calls
export const aiAPI = {
  getMatchedJobs: () =>
    api.get('/ai/match-jobs'),
  
  getSkillGaps: () =>
    api.get('/ai/skill-gap'),
};

export default api;
