const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

// 데이터베이스 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'health_education_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// 데이터베이스 연결 테스트
const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL 데이터베이스 연결 성공');
    connection.release();
    
    // 테이블 생성
    await createTables();
  } catch (error) {
    console.error('❌ MySQL 데이터베이스 연결 실패:', error.message);
    throw error;
  }
};

// 테이블 생성 함수
const createTables = async () => {
  try {
    // 사용자 테이블
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        organization VARCHAR(255),
        position VARCHAR(100),
        phone VARCHAR(20),
        role ENUM('admin', 'reviewer', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 파일 업로드 테이블
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS uploads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('uploaded', 'processing', 'completed', 'failed') DEFAULT 'uploaded',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 심사 결과 테이블
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS review_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        upload_id INT NOT NULL,
        user_id INT NOT NULL,
        subject_name VARCHAR(255) NOT NULL,
        similarity_score DECIMAL(5,2) NOT NULL,
        is_similar BOOLEAN NOT NULL,
        review_criteria JSON,
        similar_points TEXT,
        different_points TEXT,
        recommendation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 유사 과목 기준 테이블
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS similarity_criteria (
        id INT AUTO_INCREMENT PRIMARY KEY,
        criteria_name VARCHAR(255) NOT NULL,
        description TEXT,
        weight DECIMAL(3,2) DEFAULT 1.00,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 기본 유사 과목 기준 데이터 삽입
    await insertDefaultCriteria();

    console.log('✅ 데이터베이스 테이블 생성 완료');
  } catch (error) {
    console.error('❌ 테이블 생성 실패:', error.message);
    throw error;
  }
};

// 기본 유사 과목 기준 데이터 삽입
const insertDefaultCriteria = async () => {
  try {
    const criteria = [
      {
        criteria_name: '교육목표의 일치성',
        description: '과목의 교육목표가 보건교육사 자격요건과 일치하는지 평가',
        weight: 0.25
      },
      {
        criteria_name: '교육내용의 관련성',
        description: '과목의 교육내용이 보건교육 분야와 관련성이 있는지 평가',
        weight: 0.30
      },
      {
        criteria_name: '학점 및 이수시간',
        description: '과목의 학점 및 이수시간이 기준에 부합하는지 평가',
        weight: 0.15
      },
      {
        criteria_name: '교육방법의 적절성',
        description: '과목의 교육방법이 보건교육에 적합한지 평가',
        weight: 0.15
      },
      {
        criteria_name: '평가방법의 타당성',
        description: '과목의 평가방법이 보건교육사 양성에 적합한지 평가',
        weight: 0.15
      }
    ];

    for (const criterion of criteria) {
      await pool.execute(`
        INSERT IGNORE INTO similarity_criteria (criteria_name, description, weight)
        VALUES (?, ?, ?)
      `, [criterion.criteria_name, criterion.description, criterion.weight]);
    }

    console.log('✅ 기본 유사 과목 기준 데이터 삽입 완료');
  } catch (error) {
    console.error('❌ 기본 기준 데이터 삽입 실패:', error.message);
  }
};

module.exports = {
  pool,
  connectDB
};