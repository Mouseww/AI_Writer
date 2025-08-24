import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // This will be proxied by Nginx to the backend service
});

// Add a request interceptor to include the token in headers
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

export const createChapter = (novelId: number, title: string, content: string) => {
  return api.post(`/novels/${novelId}/chapters`, { title, content });
};

export const getChapters = (novelId: number) => {
  return api.get(`/novels/${novelId}/chapters`);
};

export const updateChapter = (novelId: number, chapterId: number, title: string, content: string) => {
  return api.put(`/novels/${novelId}/chapters/${chapterId}`, { title, content });
};

export const deleteChapter = (novelId: number, chapterId: number) => {
  return api.delete(`/novels/${novelId}/chapters/${chapterId}`);
};

export default api;
