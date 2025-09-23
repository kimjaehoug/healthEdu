import axios, { AxiosResponse } from 'axios';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  Upload, 
  ReviewResult, 
  ReviewCriteria,
  PaginationInfo 
} from '../types';

import { config } from '../config';

const API_BASE_URL = config.API_URL;

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
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

// 응답 인터셉터 - 토큰 만료 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authAPI = {
  // 로그인
  login: (data: LoginRequest): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/login', data),

  // 회원가입
  register: (data: RegisterRequest): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/register', data),

  // 사용자 정보 조회
  getProfile: (): Promise<AxiosResponse<{ user: User }>> =>
    api.get('/auth/profile'),

  // 비밀번호 변경
  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<AxiosResponse<{ message: string }>> =>
    api.put('/auth/change-password', data),
};

// 파일 업로드 관련 API
export const uploadAPI = {
  // 파일 업로드
  uploadFile: (file: File, subjectName?: string): Promise<AxiosResponse<{ message: string; upload: Upload }>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (subjectName) {
      formData.append('subjectName', subjectName);
    }
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 업로드 목록 조회
  getUploads: (params?: { page?: number; limit?: number; status?: string }): Promise<AxiosResponse<{ uploads: Upload[]; pagination: PaginationInfo }>> =>
    api.get('/upload', { params }),

  // 특정 업로드 조회
  getUpload: (uploadId: number): Promise<AxiosResponse<{ upload: Upload }>> =>
    api.get(`/upload/${uploadId}`),

  // 파일 다운로드
  downloadFile: (uploadId: number): Promise<AxiosResponse<Blob>> =>
    api.get(`/upload/${uploadId}/download`, { responseType: 'blob' }),

  // 파일 삭제
  deleteFile: (uploadId: number): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/upload/${uploadId}`),

  // 유사도 검사 실행
  runSimilarityCheck: (uploadId: number): Promise<AxiosResponse<{ message: string; result: any }>> =>
    api.post(`/upload/${uploadId}/similarity-check`),
};

// 심사 관련 API
export const reviewAPI = {
  // 심사 요청
  requestReview: (data: { uploadId: number; subjectName: string }): Promise<AxiosResponse<{ message: string; review: ReviewResult }>> =>
    api.post('/review/request', data),

  // 심사 결과 조회
  getReviewResult: (uploadId: number): Promise<AxiosResponse<{ review: ReviewResult }>> =>
    api.get(`/review/result/${uploadId}`),

  // 사용자 심사 결과 목록 조회
  getUserReviews: (params?: { page?: number; limit?: number; isSimilar?: boolean }): Promise<AxiosResponse<{ reviews: ReviewResult[]; pagination: PaginationInfo }>> =>
    api.get('/review/my-reviews', { params }),

  // 심사 기준 조회
  getReviewCriteria: (): Promise<AxiosResponse<{ criteria: ReviewCriteria[] }>> =>
    api.get('/review/criteria'),

  // 심사 결과 삭제
  deleteReview: (reviewId: number): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/review/${reviewId}`),
};

// 헬스 체크
export const healthAPI = {
  check: (): Promise<AxiosResponse<{ status: string; message: string }>> =>
    api.get('/health'),
};

export default api;