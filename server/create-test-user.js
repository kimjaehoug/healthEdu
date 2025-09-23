const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function createTestUser() {
  let connection;
  
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'health_education_system'
    });

    console.log('데이터베이스에 연결되었습니다.');

    // 테스트 사용자 생성
    const email = 'test@example.com';
    const password = 'password123';
    const name = '테스트 사용자';

    // 비밀번호 암호화
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 기존 사용자 삭제 (있다면)
    await connection.execute('DELETE FROM users WHERE email = ?', [email]);

    // 새 사용자 생성
    const [result] = await connection.execute(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, 'user']
    );

    console.log('✅ 테스트 사용자가 생성되었습니다!');
    console.log('📧 이메일:', email);
    console.log('🔑 비밀번호:', password);
    console.log('👤 이름:', name);
    console.log('🆔 사용자 ID:', result.insertId);

  } catch (error) {
    console.error('❌ 테스트 사용자 생성 실패:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('데이터베이스 연결을 종료했습니다.');
    }
  }
}

// 스크립트가 직접 실행될 때만 함수 호출
if (require.main === module) {
  createTestUser()
    .then(() => {
      console.log('테스트 사용자 생성 스크립트가 완료되었습니다.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('테스트 사용자 생성 실패:', error);
      process.exit(1);
    });
}

module.exports = { createTestUser };