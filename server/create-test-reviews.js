const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function createTestReviews() {
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

    // 테스트 사용자 ID 조회
    const [users] = await connection.execute('SELECT id FROM users WHERE email = ?', ['test@example.com']);
    if (users.length === 0) {
      console.log('❌ 테스트 사용자를 먼저 생성해주세요: npm run create-test-user');
      return;
    }
    const userId = users[0].id;

    // 기존 테스트 데이터 삭제
    await connection.execute('DELETE FROM review_results WHERE user_id = ?', [userId]);
    await connection.execute('DELETE FROM uploads WHERE user_id = ?', [userId]);

    // 테스트 업로드 데이터 생성
    const [uploadResult] = await connection.execute(
      'INSERT INTO uploads (user_id, original_name, file_path, file_size, file_type) VALUES (?, ?, ?, ?, ?)',
      [userId, '보건교육학개론.pdf', 'test_file.pdf', 1024000, 'application/pdf']
    );
    const uploadId = uploadResult.insertId;

    // 테스트 심사 결과 생성
    const testReviews = [
      {
        subjectName: '보건교육학 개론',
        similarityScore: 85.5,
        isSimilar: true,
        criteriaScores: {
          "문서 유사도": 90,
          "청크 유사도": 85,
          "종합 점수": 85,
          "매칭 수": 7
        },
        similarPoints: [
          "보건교육의 기본 개념과 원리",
          "건강증진 이론과 실무",
          "교육과정 설계 방법론"
        ],
        differentPoints: [
          "특정 질병 관리에 대한 심화 내용",
          "현장 실습 경험 부족"
        ],
        recommendations: [
          "보건교육 실무 경험 보완",
          "지역사회 보건교육 프로그램 참여"
        ]
      },
      {
        subjectName: '공중보건학',
        similarityScore: 92.3,
        isSimilar: true,
        criteriaScores: {
          "문서 유사도": 95,
          "청크 유사도": 90,
          "종합 점수": 92,
          "매칭 수": 9
        },
        similarPoints: [
          "공중보건의 기본 원리",
          "역학 조사 방법",
          "보건정책 수립 과정"
        ],
        differentPoints: [
          "국제보건협력 사례 부족"
        ],
        recommendations: [
          "국제보건기구 활동 참여",
          "해외 보건정책 비교 연구"
        ]
      },
      {
        subjectName: '환경보건학',
        similarityScore: 45.8,
        isSimilar: false,
        criteriaScores: {
          "문서 유사도": 50,
          "청크 유사도": 40,
          "종합 점수": 45,
          "매칭 수": 3
        },
        similarPoints: [
          "환경오염의 기본 개념"
        ],
        differentPoints: [
          "보건교육 방법론 부족",
          "건강행동 변화 이론 미포함",
          "교육과정 설계 경험 부족"
        ],
        recommendations: [
          "보건교육학 기초 과정 이수",
          "교육방법론 및 평가방법 학습",
          "실무 경험 쌓기"
        ]
      }
    ];

    for (const review of testReviews) {
      await connection.execute(
        `INSERT INTO review_results 
         (upload_id, user_id, subject_name, similarity_score, is_similar, 
          review_criteria, similar_points, different_points, recommendation, api_response) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uploadId,
          userId,
          review.subjectName,
          review.similarityScore,
          review.isSimilar,
          JSON.stringify(review.criteriaScores),
          JSON.stringify(review.similarPoints),
          JSON.stringify(review.differentPoints),
          JSON.stringify(review.recommendations),
          JSON.stringify({ mock: true, testData: review })
        ]
      );
    }

    console.log('✅ 테스트 심사 결과가 생성되었습니다!');
    console.log('📊 생성된 심사 결과:', testReviews.length + '개');
    console.log('👤 사용자 ID:', userId);
    console.log('📁 업로드 ID:', uploadId);

  } catch (error) {
    console.error('❌ 테스트 심사 결과 생성 실패:', error);
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
  createTestReviews()
    .then(() => {
      console.log('테스트 심사 결과 생성 스크립트가 완료되었습니다.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('테스트 심사 결과 생성 실패:', error);
      process.exit(1);
    });
}

module.exports = { createTestReviews };