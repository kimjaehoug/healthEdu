const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

// query_view_preview를 업로드 일부와 매칭 문서 일부로 분리하는 함수
const parseQueryPreview = (queryPreview) => {
  if (!queryPreview) return { uploaded: '', existing: '' };
  
  // [업로드 일부]와 [매칭 문서 일부] 기준으로 분리
  const parts = queryPreview.split(/(?=\[매칭 문서 일부\])/);
  
  let uploaded = '';
  let existing = '';
  
  if (parts.length >= 1) {
    // 첫 번째 부분에서 [업로드 일부] 내용 추출
    const uploadedMatch = parts[0].match(/\[업로드 일부\]([\s\S]*?)(?=\[매칭 문서 일부\]|$)/);
    if (uploadedMatch) {
      uploaded = uploadedMatch[1].trim();
    }
  }
  
  if (parts.length >= 2) {
    // 두 번째 부분에서 [매칭 문서 일부] 내용 추출
    const existingMatch = parts[1].match(/\[매칭 문서 일부\]([\s\S]*?)(?=\[업로드 일부\]|$)/);
    if (existingMatch) {
      existing = existingMatch[1].trim();
    }
  }
  
  // 텍스트 정리 (너무 긴 경우 자르기)
  uploaded = uploaded.length > 300 ? uploaded.substring(0, 300) + '...' : uploaded;
  existing = existing.length > 300 ? existing.substring(0, 300) + '...' : existing;
  
  return { uploaded, existing };
};

async function migrateSimilarPoints() {
  let connection;
  
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'health_education_system'
    });

    console.log('🔗 데이터베이스 연결 성공');

    // similar_points가 있는 review_results 조회
    const [reviews] = await connection.execute(
      'SELECT id, similar_points FROM review_results WHERE similar_points IS NOT NULL AND similar_points != "[]"'
    );

    console.log(`📋 마이그레이션할 리뷰 수: ${reviews.length}개`);

    for (const review of reviews) {
      try {
        let similarPoints = [];
        
        // JSON 파싱
        if (typeof review.similar_points === 'string') {
          similarPoints = JSON.parse(review.similar_points);
        } else {
          similarPoints = review.similar_points;
        }

        if (!Array.isArray(similarPoints)) {
          console.log(`⚠️ 리뷰 ${review.id}: similar_points가 배열이 아님`);
          continue;
        }

        let updatedPoints = [];
        let hasChanges = false;

        for (const point of similarPoints) {
          // queryPreview가 있는 기존 구조인지 확인
          if (typeof point === 'object' && point.rationale && point.queryPreview && !point.uploadedContent) {
            const previewParts = parseQueryPreview(point.queryPreview);
            
            updatedPoints.push({
              rationale: point.rationale,
              uploadedContent: previewParts.uploaded,
              existingContent: previewParts.existing,
              confidence: point.confidence || 0,
              docId: point.docId || 'unknown'
            });
            
            hasChanges = true;
            console.log(`✅ 리뷰 ${review.id}: queryPreview를 uploadedContent/existingContent로 변환`);
          } else {
            // 이미 새로운 구조이거나 다른 형태는 그대로 유지
            updatedPoints.push(point);
          }
        }

        if (hasChanges) {
          // 데이터베이스 업데이트
          await connection.execute(
            'UPDATE review_results SET similar_points = ? WHERE id = ?',
            [JSON.stringify(updatedPoints), review.id]
          );
          
          console.log(`🔄 리뷰 ${review.id} 업데이트 완료`);
        }

      } catch (error) {
        console.error(`❌ 리뷰 ${review.id} 처리 중 오류:`, error.message);
      }
    }

    console.log('✅ 마이그레이션 완료!');

  } catch (error) {
    console.error('❌ 마이그레이션 오류:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 데이터베이스 연결 종료');
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  migrateSimilarPoints();
}

module.exports = { migrateSimilarPoints, parseQueryPreview };
