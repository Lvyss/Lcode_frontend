// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,

});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - UPDATE INI JUGA
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // window.location.href = '/login'; // ✅ COMMENT REDIRECT DULU
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
   login: () => window.location.href = 'http://localhost:8000/oauth/google', 
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
};

export const languageAPI = {
  getAll: () => api.get('/languages'),
  getSections: (languageId) => api.get(`/languages/${languageId}/sections`),
};


// src/services/api.js
export const userAPI = {
  // Auth
  auth: {
    login: (data) => api.post('/login', data),
    logout: () => api.post('/logout'),
    getUser: () => api.get('/user'),
  },

  // Progress
  progress: {
    get: () => api.get('/user/progress'),
        getPartProgress: (partId) => api.get(`/progress/part/${partId}`),
        getSectionProgress: (sectionId) => api.get(`/progress/section/${sectionId}`), // ✅ NEW
    completeExercise: (data) => api.post('/progress/complete-exercise', data),
    getExerciseStatus: (exerciseId) => 
      api.get(`/progress/exercise-status/${exerciseId}`) // ✅ METHOD BARU
        
  },

  // Languages
  languages: {
    getAll: () => api.get('/languages'),
    getById: (id) => api.get(`/languages/${id}`),
    getSections: (id) => api.get(`/languages/${id}/sections`),
  },

  // Sections
    sections: {
      getById: (id) => api.get(`/sections/${id}`),
      getParts: (id) => api.get(`/sections/${id}/parts`),
    },

  // Parts
  parts: {
    getById: (id) => api.get(`/parts/${id}`),
    getWithContent: (id) => api.get(`/parts/${id}/content`),
    getExercises: (id) => api.get(`/parts/${id}/exercises`),
  },

  // Exercises
  exercises: {
    getById: (id) => axios.get(`/api/exercises/${id}`),
    submitAnswer: (exerciseId, answer) => 
      axios.post(`/api/exercises/${exerciseId}/submit`, { answer }),
    checkCodeTest: (data) => api.post('/exercises/code-test/check', data)
  },
    badges: {
    getUserBadges: () => api.get('/user/badges'),
    getSectionBadges: (sectionId) => api.get(`/sections/${sectionId}/badges`),
  },
};

// src/services/api.js - UPDATE LENGKAP
export const adminAPI = {
  dashboard: {
    getStats: () => api.get('/admin/dashboard'),
  },
  languages: {
    get: () => api.get('/admin/languages'),
    create: (data) => api.post('/admin/languages', data),
    update: (id, data) => api.put(`/admin/languages/${id}`, data),
    delete: (id) => api.delete(`/admin/languages/${id}`),
  },
  sections: {
    getByLanguage: (languageId) => api.get(`/admin/languages/${languageId}/sections`),
    create: (data) => api.post('/admin/sections', data),
    update: (id, data) => api.put(`/admin/sections/${id}`, data),
    delete: (id) => api.delete(`/admin/sections/${id}`),
  },
  parts: {
    getBySection: (sectionId) => api.get(`/admin/sections/${sectionId}/parts`),
    create: (data) => api.post('/admin/parts', data),
    update: (id, data) => api.put(`/admin/parts/${id}`, data),
    delete: (id) => api.delete(`/admin/parts/${id}`), // ✅ INI MASIH DELETE
  },
  
  contentBlocks: {
    getByPart: (partId) => api.get(`/admin/parts/${partId}/content-blocks`),
    create: (partId, data) => api.post(`/admin/parts/${partId}/content-blocks`, data),
    update: (partId, blockId, data) => api.put(`/admin/parts/${partId}/content-blocks/${blockId}`, data),
    delete: (partId, blockId) => api.delete(`/admin/parts/${partId}/content-blocks/${blockId}`),
  },
  exercises: {
    getByPart: (partId) => api.get(`/admin/parts/${partId}/exercises`),
    create: (data) => api.post('/admin/exercises', data),
    update: (id, data) => api.put(`/admin/exercises/${id}`, data),
    delete: (id) => api.delete(`/admin/exercises/${id}`),
  },
  badges: {
  get: () => api.get('/admin/badges'),
  getSections: () => api.get('/admin/badges/sections'), // ✅ NEW ENDPOINT
  create: (data) => api.post('/admin/badges', data, {
    headers: { 'Content-Type': 'multipart/form-data' } // ✅ IMPORTANT FOR FILES
  }),
  update: (id, data) => api.put(`/admin/badges/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/admin/badges/${id}`),
  },

};

export default api;