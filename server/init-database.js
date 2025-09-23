const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  let connection;
  
  try {
    // MySQL 서버에 연결 (데이터베이스 없이)
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // 비밀번호가 있다면 여기에 입력
      multipleStatements: true
    });

    console.log('MySQL 서버에 연결되었습니다.');

    // 데이터베이스 삭제 및 재생성
    await connection.query('DROP DATABASE IF EXISTS health_education_system');
    console.log('기존 데이터베이스를 삭제했습니다.');

    await connection.query('CREATE DATABASE health_education_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('새 데이터베이스를 생성했습니다.');

    await connection.query('USE health_education_system');
    console.log('데이터베이스를 선택했습니다.');

    // SQL 파일 읽기
    const sqlFile = path.join(__dirname, 'database.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // SQL 실행
    await connection.query(sqlContent);
    console.log('데이터베이스 스키마를 생성했습니다.');

    // 기본 데이터 삽입
    await connection.query(`
      INSERT INTO similarity_criteria (criteria_name, description, weight) VALUES
      ('교육목표의 일치성', '과목의 교육목표가 보건교육사 자격요건과 일치하는지 평가', 0.25),
      ('교육내용의 관련성', '과목의 교육내용이 보건교육 분야와 관련성이 있는지 평가', 0.30),
      ('학점 및 이수시간', '과목의 학점 및 이수시간이 기준에 부합하는지 평가', 0.15),
      ('교육방법의 적절성', '과목의 교육방법이 보건교육에 적합한지 평가', 0.15),
      ('평가방법의 타당성', '과목의 평가방법이 보건교육사 양성에 적합한지 평가', 0.15)
    `);
    console.log('기본 데이터를 삽입했습니다.');

    console.log('✅ 데이터베이스 초기화가 완료되었습니다!');
    console.log('✅ api_response 컬럼이 포함된 review_results 테이블이 생성되었습니다.');

  } catch (error) {
    console.error('❌ 데이터베이스 초기화 중 오류가 발생했습니다:', error);
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
  initializeDatabase()
    .then(() => {
      console.log('데이터베이스 초기화 스크립트가 완료되었습니다.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('데이터베이스 초기화 실패:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };