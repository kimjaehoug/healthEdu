const { pool } = require('../config/database');

// AI 서버 목업 데이터 생성 함수
const generateMockReviewData = (uploadId, subjectName) => {
  // 랜덤한 유사도 점수 생성 (60-95 사이)
  const similarityScore = Math.floor(Math.random() * 36) + 60;
  const isSimilar = similarityScore >= 70;

  // 목업 심사 기준별 점수
  const criteriaScores = {
    '교육목표의 일치성': Math.floor(Math.random() * 21) + 80, // 80-100
    '교육내용의 관련성': Math.floor(Math.random() * 21) + 80, // 80-100
    '학점 및 이수시간': Math.floor(Math.random() * 21) + 80, // 80-100
    '교육방법의 적절성': Math.floor(Math.random() * 21) + 80, // 80-100
    '평가방법의 타당성': Math.floor(Math.random() * 21) + 80  // 80-100
  };

  // 목업 유사한 점들
  const similarPoints = [
    '과목의 교육목표가 보건교육사 자격요건과 높은 일치성을 보입니다.',
    '교육내용이 보건교육 분야의 핵심 영역을 포괄적으로 다루고 있습니다.',
    '학점 및 이수시간이 기준에 적합하게 설정되어 있습니다.',
    '교육방법이 보건교육에 적합한 실습 중심의 구성으로 되어 있습니다.',
    '평가방법이 보건교육사 양성에 적합한 포트폴리오 평가를 포함하고 있습니다.'
  ];

  // 목업 다른 점들
  const differentPoints = [
    '일부 교육내용이 보건교육 분야와 직접적인 관련성이 낮습니다.',
    '실습 시간의 비중이 기준에 비해 다소 부족합니다.',
    '평가 기준이 보건교육사 자격요건과 완전히 일치하지 않는 부분이 있습니다.'
  ];

  // 목업 권고사항
  const recommendations = isSimilar 
    ? [
        '유사 과목으로 인정 가능합니다.',
        '교육내용을 보건교육 분야에 더 특화하여 개선하면 더욱 좋겠습니다.',
        '실습 시간을 늘려 보건교육사 양성에 더 적합하게 만들 수 있습니다.'
      ]
    : [
        '유사 과목 인정을 위해서는 교육목표를 보건교육사 자격요건에 맞게 수정이 필요합니다.',
        '교육내용의 보건교육 관련성을 높이기 위한 개선이 필요합니다.',
        '학점 및 이수시간을 기준에 맞게 조정해야 합니다.'
      ];

  return {
    similarityScore,
    isSimilar,
    criteriaScores,
    similarPoints: similarPoints.slice(0, Math.floor(Math.random() * 3) + 3),
    differentPoints: differentPoints.slice(0, Math.floor(Math.random() * 2) + 1),
    recommendations: recommendations.slice(0, Math.floor(Math.random() * 2) + 2)
  };
};

// 심사 요청
const requestReview = async (req, res) => {
  try {
    const { uploadId, subjectName } = req.body;
    const userId = req.user.id;

    // 업로드 파일 존재 확인
    const [uploads] = await pool.execute(
      'SELECT * FROM uploads WHERE id = ? AND user_id = ?',
      [uploadId, userId]
    );

    if (uploads.length === 0) {
      return res.status(404).json({
        message: '업로드된 파일을 찾을 수 없습니다.',
        code: 'UPLOAD_NOT_FOUND'
      });
    }

    const upload = uploads[0];

    // 이미 심사가 완료된 경우 확인
    const [existingReviews] = await pool.execute(
      'SELECT id FROM review_results WHERE upload_id = ?',
      [uploadId]
    );

    if (existingReviews.length > 0) {
      return res.status(409).json({
        message: '이미 심사가 완료된 파일입니다.',
        code: 'ALREADY_REVIEWED'
      });
    }

    // 업로드 상태를 처리 중으로 변경
    await pool.execute(
      'UPDATE uploads SET status = ? WHERE id = ?',
      ['processing', uploadId]
    );

    // AI 서버 목업 데이터 생성 (실제로는 AI 서버로 전송)
    const mockData = generateMockReviewData(uploadId, subjectName);

    // 심사 결과 저장
    const [result] = await pool.execute(
      `INSERT INTO review_results 
       (upload_id, user_id, subject_name, similarity_score, is_similar, 
        review_criteria, similar_points, different_points, recommendation) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uploadId,
        userId,
        subjectName,
        mockData.similarityScore,
        mockData.isSimilar,
        JSON.stringify(mockData.criteriaScores),
        mockData.similarPoints.join('\n'),
        mockData.differentPoints.join('\n'),
        mockData.recommendations.join('\n')
      ]
    );

    // 업로드 상태를 완료로 변경
    await pool.execute(
      'UPDATE uploads SET status = ? WHERE id = ?',
      ['completed', uploadId]
    );

    res.status(201).json({
      message: '심사가 완료되었습니다.',
      review: {
        id: result.insertId,
        uploadId,
        subjectName,
        similarityScore: mockData.similarityScore,
        isSimilar: mockData.isSimilar,
        criteriaScores: mockData.criteriaScores,
        similarPoints: mockData.similarPoints,
        differentPoints: mockData.differentPoints,
        recommendations: mockData.recommendations,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('심사 요청 오류:', error);
    
    // 오류 발생 시 업로드 상태를 실패로 변경
    if (req.body.uploadId) {
      await pool.execute(
        'UPDATE uploads SET status = ?, error_message = ? WHERE id = ?',
        ['failed', error.message, req.body.uploadId]
      );
    }

    res.status(500).json({
      message: '심사 처리 중 오류가 발생했습니다.',
      code: 'REVIEW_ERROR'
    });
  }
};

// 심사 결과 조회
const getReviewResult = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const userId = req.user.id;

    const [reviews] = await pool.execute(
      `SELECT r.*, u.original_name, u.upload_date
       FROM review_results r
       JOIN uploads u ON r.upload_id = u.id
       WHERE r.upload_id = ? AND r.user_id = ?`,
      [uploadId, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        message: '심사 결과를 찾을 수 없습니다.',
        code: 'REVIEW_NOT_FOUND'
      });
    }

    const review = reviews[0];
    
    // JSON 필드 파싱
    if (review.review_criteria) {
      review.review_criteria = JSON.parse(review.review_criteria);
    }

    res.json({
      review
    });

  } catch (error) {
    console.error('심사 결과 조회 오류:', error);
    res.status(500).json({
      message: '심사 결과를 불러오는 중 오류가 발생했습니다.',
      code: 'FETCH_ERROR'
    });
  }
};

// 사용자의 모든 심사 결과 조회
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, isSimilar } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, u.original_name, u.upload_date
      FROM review_results r
      JOIN uploads u ON r.upload_id = u.id
      WHERE r.user_id = ?
    `;
    let params = [userId];

    if (isSimilar !== undefined) {
      query += ' AND r.is_similar = ?';
      params.push(isSimilar === 'true');
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [reviews] = await pool.execute(query, params);

    // JSON 필드 파싱 및 클라이언트 형식으로 변환
    const formattedReviews = reviews.map(review => {
      let criteriaScores = {};
      let similarPoints = [];
      let differentPoints = [];
      let recommendations = [];

      // JSON 필드 파싱
      if (review.review_criteria) {
        try {
          criteriaScores = JSON.parse(review.review_criteria);
        } catch (e) {
          console.log('review_criteria 파싱 오류:', e);
          criteriaScores = {};
        }
      }
      if (review.similar_points) {
        try {
          similarPoints = JSON.parse(review.similar_points);
        } catch (e) {
          console.log('similar_points 파싱 오류:', e);
          similarPoints = [];
        }
      }
      if (review.different_points) {
        try {
          differentPoints = JSON.parse(review.different_points);
        } catch (e) {
          console.log('different_points 파싱 오류:', e);
          differentPoints = [];
        }
      }
      if (review.recommendation) {
        try {
          recommendations = JSON.parse(review.recommendation);
        } catch (e) {
          console.log('recommendation 파싱 오류:', e);
          recommendations = [];
        }
      }

      return {
        id: review.id,
        uploadId: review.upload_id,
        userId: review.user_id,
        subjectName: review.subject_name,
        similarityScore: review.similarity_score,
        isSimilar: review.is_similar,
        criteriaScores,
        similarPoints,
        differentPoints,
        recommendations,
        createdAt: review.created_at
      };
    });

    // 전체 개수 조회
    let countQuery = 'SELECT COUNT(*) as total FROM review_results WHERE user_id = ?';
    let countParams = [userId];

    if (isSimilar !== undefined) {
      countQuery += ' AND is_similar = ?';
      countParams.push(isSimilar === 'true');
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      reviews: formattedReviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('사용자 심사 결과 조회 오류:', error);
    res.status(500).json({
      message: '심사 결과 목록을 불러오는 중 오류가 발생했습니다.',
      code: 'FETCH_ERROR'
    });
  }
};

// 심사 기준 조회
const getReviewCriteria = async (req, res) => {
  try {
    const [criteria] = await pool.execute(
      'SELECT * FROM similarity_criteria ORDER BY weight DESC'
    );

    res.json({
      criteria
    });

  } catch (error) {
    console.error('심사 기준 조회 오류:', error);
    res.status(500).json({
      message: '심사 기준을 불러오는 중 오류가 발생했습니다.',
      code: 'FETCH_ERROR'
    });
  }
};

// 심사 결과 삭제
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    console.log('심사 결과 삭제 요청:', { reviewId, userId });

    // 해당 심사 결과가 존재하고 사용자의 것인지 확인
    const [reviews] = await pool.execute(
      'SELECT id, user_id FROM review_results WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        message: '심사 결과를 찾을 수 없거나 삭제 권한이 없습니다.',
        code: 'NOT_FOUND'
      });
    }

    // 심사 결과 삭제
    await pool.execute(
      'DELETE FROM review_results WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );

    console.log('심사 결과 삭제 완료:', reviewId);

    res.status(200).json({
      message: '심사 결과가 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('심사 결과 삭제 오류:', error);
    res.status(500).json({
      message: '심사 결과 삭제 중 오류가 발생했습니다.',
      code: 'DELETE_ERROR'
    });
  }
};

module.exports = {
  requestReview,
  getReviewResult,
  getUserReviews,
  getReviewCriteria,
  deleteReview
};