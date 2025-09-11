// 导入全局 navigate 引用
import { navigateRef } from '../App';

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

// Add a response interceptor to handle 401 errors (authentication failure)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 清除本地存储的 token
      localStorage.removeItem('token');
      
      // 跳转到登录页面
      if (navigateRef.current) {
        navigateRef.current('/login', { replace: true });
      } else {
        // 备用方案：直接跳转
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const createChapter = (novelId: number, title: string, content: string, wordCount: number) => {
  return api.post(`/novels/${novelId}/chapters`, { title, content, wordCount });
};

export const getChapters = (novelId: number) => {
  return api.get(`/novels/${novelId}/chapters`);
};

export const getChapter = (novelId: number, chapterId: number) => {
  return api.get(`/novels/${novelId}/chapters/${chapterId}`);
};

export const updateChapter = (novelId: number, chapterId: number, title: string, content: string, wordCount: number) => {
  return api.put(`/novels/${novelId}/chapters/${chapterId}`, { title, content, wordCount });
};

export const deleteChapter = (novelId: number, chapterId: number) => {
  return api.delete(`/novels/${novelId}/chapters/${chapterId}`);
};

export const getNovel = (id: number) => {
  return api.get(`/novels/${id}`);
};

export const updateNovel = (id: number, data: any) => {
  return api.put(`/novels/${id}`, data);
};

export const getAllNovelPlatforms = () => {
  return api.get('/platforms/novel-platforms');
};

export const getUserNovelPlatforms = () => {
  return api.get('/platforms/user-novel-platforms');
};

export const createUserNovelPlatform = (data: any) => {
  return api.post('/platforms/user-novel-platforms', data);
};

export const deleteUserNovelPlatform = (id: number) => {
  return api.delete(`/platforms/user-novel-platforms/${id}`);
};

export const publishChapter = (novelId: number, chapterId: number) => {
  return api.post('/platforms/publish-chapter', { novelId, chapterId });
};

export const clearChapters = (novelId: number) => {
  return api.delete(`/novels/${novelId}/chapters`);
};

export const clearHistory = (novelId: number) => {
  return api.delete(`/novels/${novelId}/history`);
};

export const addUserMessage = (novelId: number, message: string) => {
  return api.post(`/novels/${novelId}/history`, { message });
};

export const rewriteChapter = (novelId: number, chapterId: number) => {
    return api.post(`/novels/${novelId}/chapters/${chapterId}/rewrite`);
};

export default api;
