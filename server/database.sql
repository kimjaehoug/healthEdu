-- 보건 교육사 유사 과목 심사 자동화 시스템 데이터베이스 스키마
-- MySQL 8.0 이상 권장

CREATE DATABASE IF NOT EXISTS health_education_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE health_education_system;

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL COMMENT '이메일 (로그인 ID)',
    password VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호',
    name VARCHAR(100) NOT NULL COMMENT '사용자 이름',
    organization VARCHAR(255) COMMENT '소속 기관',
    position VARCHAR(100) COMMENT '직책',
    phone VARCHAR(20) COMMENT '연락처',
    role ENUM('admin', 'reviewer', 'user') DEFAULT 'user' COMMENT '사용자 권한',
    is_active BOOLEAN DEFAULT true COMMENT '계정 활성화 상태',
    last_login TIMESTAMP NULL COMMENT '마지막 로그인 시간',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '계정 생성일',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '계정 수정일'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 정보';

-- 파일 업로드 테이블
CREATE TABLE IF NOT EXISTS uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '업로드한 사용자 ID',
    original_name VARCHAR(255) NOT NULL COMMENT '원본 파일명',
    file_path VARCHAR(500) NOT NULL COMMENT '저장된 파일 경로',
    file_size INT NOT NULL COMMENT '파일 크기 (bytes)',
    file_type VARCHAR(100) NOT NULL COMMENT '파일 MIME 타입',
    subject_name VARCHAR(255) COMMENT '과목명',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '업로드 일시',
    status ENUM('uploaded', 'processing', 'completed', 'failed') DEFAULT 'uploaded' COMMENT '처리 상태',
    error_message TEXT COMMENT '오류 메시지',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='파일 업로드 정보';

-- 심사 결과 테이블
CREATE TABLE IF NOT EXISTS review_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upload_id INT NOT NULL COMMENT '업로드 파일 ID',
    user_id INT NOT NULL COMMENT '사용자 ID',
    subject_name VARCHAR(255) NOT NULL COMMENT '과목명',
    similarity_score DECIMAL(5,2) NOT NULL COMMENT '유사도 점수 (0-100)',
    is_similar BOOLEAN NOT NULL COMMENT '유사 과목 여부',
    review_criteria JSON COMMENT '심사 기준별 점수',
    similar_points TEXT COMMENT '유사한 점들',
    different_points TEXT COMMENT '다른 점들',
    recommendation TEXT COMMENT '권고사항',
    reviewer_notes TEXT COMMENT '심사자 메모',
    api_response JSON COMMENT 'API 응답 데이터',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '심사 완료일',
    FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='심사 결과';

-- 유사 과목 기준 테이블
CREATE TABLE IF NOT EXISTS similarity_criteria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    criteria_name VARCHAR(255) NOT NULL COMMENT '기준명',
    description TEXT COMMENT '기준 설명',
    weight DECIMAL(3,2) DEFAULT 1.00 COMMENT '가중치',
    is_active BOOLEAN DEFAULT true COMMENT '활성화 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='유사 과목 심사 기준';

-- 심사 이력 테이블
CREATE TABLE IF NOT EXISTS review_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_result_id INT NOT NULL COMMENT '심사 결과 ID',
    action VARCHAR(50) NOT NULL COMMENT '작업 유형',
    old_value TEXT COMMENT '이전 값',
    new_value TEXT COMMENT '새로운 값',
    user_id INT NOT NULL COMMENT '작업한 사용자 ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '작업 일시',
    FOREIGN KEY (review_result_id) REFERENCES review_results(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='심사 이력';

-- 기본 유사 과목 기준 데이터 삽입
INSERT INTO similarity_criteria (criteria_name, description, weight) VALUES
('교육목표의 일치성', '과목의 교육목표가 보건교육사 자격요건과 일치하는지 평가', 0.25),
('교육내용의 관련성', '과목의 교육내용이 보건교육 분야와 관련성이 있는지 평가', 0.30),
('학점 및 이수시간', '과목의 학점 및 이수시간이 기준에 부합하는지 평가', 0.15),
('교육방법의 적절성', '과목의 교육방법이 보건교육에 적합한지 평가', 0.15),
('평가방법의 타당성', '과목의 평가방법이 보건교육사 양성에 적합한지 평가', 0.15);

-- 인덱스 생성
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_uploads_status ON uploads(status);
CREATE INDEX idx_review_results_user_id ON review_results(user_id);
CREATE INDEX idx_review_results_upload_id ON review_results(upload_id);
CREATE INDEX idx_review_results_created_at ON review_results(created_at);
CREATE INDEX idx_similarity_criteria_active ON similarity_criteria(is_active);