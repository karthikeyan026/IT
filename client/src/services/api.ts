import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    login: (name: string, regNo: string) =>
        api.post('/auth/login', { name, regNo }),
    
    adminLogin: (username: string, password: string) =>
        api.post('/auth/admin/login', { username, password }),
    
    getStatus: () => api.get('/auth/status')
};

// Questions API
export const questionsAPI = {
    getRound: (round: string) => api.get(`/questions/${round}`),
    
    getQuestion: (questionId: string) => api.get(`/questions/single/${questionId}`),
    
    seedTechnical: () => api.post('/questions/seed/technical'),
    
    seedAptitude: () => api.post('/questions/seed/aptitude')
};

// Submissions API
export const submissionsAPI = {
    submit: (studentId: string, questionId: string, answer: string, timeTaken: number) =>
        api.post('/submissions/submit', { studentId, questionId, answer, timeTaken }),
    
    getStudentSubmissions: (studentId: string) =>
        api.get(`/submissions/student/${studentId}`),
    
    getAllSubmissions: () => api.get('/submissions/all')
};

// Violations API
export const violationsAPI = {
    log: (studentId: string, type: string) =>
        api.post('/violations/log', { studentId, type }),
    
    getStudentViolations: (studentId: string) =>
        api.get(`/violations/student/${studentId}`),
    
    getSuspicious: () => api.get('/violations/suspicious')
};

// Admin API
export const adminAPI = {
    startTechnical: () => api.post('/admin/start/technical'),
    
    stopTechnical: () => api.post('/admin/stop/technical'),
    
    startAptitude: () => api.post('/admin/start/aptitude'),
    
    stopAptitude: () => api.post('/admin/stop/aptitude'),
    
    lock: () => api.post('/admin/lock'),
    
    getDashboardStats: () => api.get('/admin/dashboard/stats'),
    
    getActivity: () => api.get('/admin/dashboard/activity'),
    
    getLeaderboard: () => api.get('/admin/leaderboard'),
    
    getQualifiedStudents: () => api.get('/admin/dashboard/qualified'),

    getPlagiarismLogs: () => api.get('/admin/plagiarism'),

    syncStudentsFromPdf: () => api.post('/admin/students/sync')
};
