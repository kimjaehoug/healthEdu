export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'reviewer' | 'user';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organization?: string;
  position?: string;
  phone?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Upload {
  id: number;
  originalName: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  similarityScore?: number;
  isSimilar?: boolean;
  reviewDate?: string;
}

// 유사한 점의 구조화된 데이터 타입
export interface SimilarPoint {
  uploadedContent: string;
  existingContent: string;
  similarity: number;
}

export interface ReviewResult {
  id: number;
  uploadId: number;
  userId: number;
  subjectName: string;
  similarityScore: number;
  isSimilar: boolean;
  criteriaScores: Record<string, number>;
  similarPoints: (string | SimilarPoint)[]; // 기존 문자열과 새로운 구조화된 데이터 모두 지원
  differentPoints: string[];
  recommendations: string[];
  createdAt: string;
}

export interface ReviewCriteria {
  id: number;
  criteriaName: string;
  description: string;
  weight: number;
  isActive: boolean;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}