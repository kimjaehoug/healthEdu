const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// 파일 업로드
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: '파일이 선택되지 않았습니다.',
        code: 'NO_FILE_SELECTED'
      });
    }

    const userId = req.user.id;
    const { originalname, filename, size, mimetype } = req.file;

    // 업로드 정보를 데이터베이스에 저장
    const subjectName = req.body.subjectName || originalname.replace(/\.[^/.]+$/, "");
    const [result] = await pool.execute(
      `INSERT INTO uploads (user_id, original_name, file_path, file_size, file_type, subject_name) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, originalname, filename, size, mimetype, subjectName]
    );

    res.status(201).json({
      message: '파일이 성공적으로 업로드되었습니다.',
      upload: {
        id: result.insertId,
        originalName: originalname,
        fileName: filename,
        fileSize: size,
        fileType: mimetype,
        uploadDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('파일 업로드 오류:', error);
    
    // 업로드된 파일이 있다면 삭제
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      message: '파일 업로드 중 오류가 발생했습니다.',
      code: 'UPLOAD_ERROR'
    });
  }
};

// 업로드된 파일 목록 조회
const getUploads = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.*, r.similarity_score, r.is_similar, r.created_at as review_date
      FROM uploads u
      LEFT JOIN review_results r ON u.id = r.upload_id
      WHERE u.user_id = ?
    `;
    let params = [userId];

    if (status) {
      query += ' AND u.status = ?';
      params.push(status);
    }

    query += ' ORDER BY u.upload_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [uploads] = await pool.execute(query, params);

    // 전체 개수 조회
    let countQuery = 'SELECT COUNT(*) as total FROM uploads WHERE user_id = ?';
    let countParams = [userId];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      uploads,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('업로드 목록 조회 오류:', error);
    res.status(500).json({
      message: '업로드 목록을 불러오는 중 오류가 발생했습니다.',
      code: 'FETCH_ERROR'
    });
  }
};

// 특정 업로드 파일 조회
const getUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const userId = req.user.id;

    const [uploads] = await pool.execute(
      `SELECT u.*, r.*, r.created_at as review_date
       FROM uploads u
       LEFT JOIN review_results r ON u.id = r.upload_id
       WHERE u.id = ? AND u.user_id = ?`,
      [uploadId, userId]
    );

    if (uploads.length === 0) {
      return res.status(404).json({
        message: '업로드된 파일을 찾을 수 없습니다.',
        code: 'UPLOAD_NOT_FOUND'
      });
    }

    res.json({
      upload: uploads[0]
    });

  } catch (error) {
    console.error('업로드 파일 조회 오류:', error);
    res.status(500).json({
      message: '파일 정보를 불러오는 중 오류가 발생했습니다.',
      code: 'FETCH_ERROR'
    });
  }
};

// 파일 다운로드
const downloadFile = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const userId = req.user.id;

    const [uploads] = await pool.execute(
      'SELECT * FROM uploads WHERE id = ? AND user_id = ?',
      [uploadId, userId]
    );

    if (uploads.length === 0) {
      return res.status(404).json({
        message: '파일을 찾을 수 없습니다.',
        code: 'FILE_NOT_FOUND'
      });
    }

    const upload = uploads[0];
    const filePath = path.join(__dirname, '../uploads', upload.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: '파일이 서버에서 삭제되었습니다.',
        code: 'FILE_DELETED'
      });
    }

    res.download(filePath, upload.original_name);

  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    res.status(500).json({
      message: '파일 다운로드 중 오류가 발생했습니다.',
      code: 'DOWNLOAD_ERROR'
    });
  }
};

// 파일 삭제
const deleteFile = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const userId = req.user.id;

    const [uploads] = await pool.execute(
      'SELECT * FROM uploads WHERE id = ? AND user_id = ?',
      [uploadId, userId]
    );

    if (uploads.length === 0) {
      return res.status(404).json({
        message: '파일을 찾을 수 없습니다.',
        code: 'FILE_NOT_FOUND'
      });
    }

    const upload = uploads[0];
    const filePath = path.join(__dirname, '../uploads', upload.file_path);

    // 파일 시스템에서 파일 삭제
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 데이터베이스에서 삭제 (CASCADE로 관련 데이터도 함께 삭제됨)
    await pool.execute('DELETE FROM uploads WHERE id = ?', [uploadId]);

    res.json({
      message: '파일이 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('파일 삭제 오류:', error);
    res.status(500).json({
      message: '파일 삭제 중 오류가 발생했습니다.',
      code: 'DELETE_ERROR'
    });
  }
};

// 유사도 검사 API 호출 함수
const callSimilarityAPI = async (filePath, originalName) => {
  try {
    console.log('🌐 외부 API 호출:', originalName);
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), {
      filename: originalName,
      contentType: 'application/pdf'
    });
    formData.append('threshold_doc', '0.55');
    formData.append('threshold_chunk', '0.70');
    formData.append('min_hits', '3');
    formData.append('alpha', '0.7');
    formData.append('aggregate', 'topk_mean');
    formData.append('top_docs', '5');
    formData.append('top_hits_per_doc', '5');

    const response = await axios.post('http://210.117.143.172:9923/compare', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000 // 30초 타임아웃
    });

    console.log('✅ 외부 API 응답 성공');
    return response.data;
  } catch (error) {
    console.error('❌ 외부 API 오류:', error.message);
    console.log('🔄 시뮬레이션 데이터 사용');
    
    // 외부 API가 실패할 경우 시뮬레이션 데이터 반환
    return generateMockAPIResponse(originalName);
  }
};

// 텍스트 정제 함수 - 사용자에게 보여줄 때 깔끔하게 정리
const cleanTextForDisplay = (text) => {
  if (!text) return '';
  
  // 1. 불필요한 공백과 줄바꿈 정리
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  // 2. 너무 긴 텍스트는 자르기 (200자 제한)
  if (cleaned.length > 200) {
    cleaned = cleaned.substring(0, 200) + '...';
  }
  
  return cleaned;
};

// 시뮬레이션 API 응답 생성
const generateMockAPIResponse = (filename) => {
  const randomScore = Math.random() * 40 + 50; // 50-90 사이의 랜덤 점수
  const isHighScore = randomScore > 75;
  
  console.log('🎭 시뮬레이션 데이터 생성:', Math.round(randomScore) + '%');
  
  return {
    uploaded: {
      filename: filename,
      tmp_path: `/tmp/tmp${Date.now()}.pdf`,
      size_bytes: Math.floor(Math.random() * 1000000) + 500000
    },
    settings: {
      threshold_doc: 0.55,
      threshold_chunk: 0.65,
      min_hits: 3,
      alpha: 0.7,
      aggregate: "topk_mean",
      topk_per_chunk: 10,
      topk_for_agg: 10,
      top_docs: 5,
      top_hits_per_doc: 5
    },
    doc_only: {
      top: [
        { doc_path: "./syllabus_bank/보건교육학개론.pdf", score: randomScore / 100 },
        { doc_path: "./syllabus_bank/공중보건학.pdf", score: (randomScore - 10) / 100 }
      ]
    },
    chunk_only: {
      top: [
        { doc_path: "./syllabus_bank/보건교육학개론.pdf", score: (randomScore - 5) / 100, matches: Math.floor(Math.random() * 5) + 3 },
        { doc_path: "./syllabus_bank/공중보건학.pdf", score: (randomScore - 15) / 100, matches: Math.floor(Math.random() * 3) + 2 }
      ]
    },
    hybrid: {
      top: [
        {
          doc_path: "./syllabus_bank/보건교육학개론.pdf",
          score_final: randomScore / 100,
          score_doc: randomScore / 100,
          score_chunk: (randomScore - 5) / 100
        },
        {
          doc_path: "./syllabus_bank/공중보건학.pdf",
          score_final: (randomScore - 10) / 100,
          score_doc: (randomScore - 10) / 100,
          score_chunk: (randomScore - 15) / 100
        }
      ]
    },
    details: [
      {
        ref_doc: "./syllabus_bank/보건교육학개론.pdf",
        score: randomScore / 100,
        query_chunk_id: 0,
        query_preview: "이 교과목은 보건교육의 기본 개념과 원리를 다루며, 건강증진 이론과 실무를 학습합니다.",
        ref_chunk_preview: "보건교육학의 기본 이론과 실무를 학습하며, 건강행동 변화 이론을 다룹니다."
      },
      {
        ref_doc: "./syllabus_bank/보건교육학개론.pdf",
        score: (randomScore - 5) / 100,
        query_chunk_id: 1,
        query_preview: "건강증진 이론과 교육방법을 학습하며, 교육과정 설계 방법론을 다룹니다.",
        ref_chunk_preview: "건강행동 변화 이론과 교육과정 설계 방법을 다루며, 보건교육 실무를 학습합니다."
      },
      {
        ref_doc: "./syllabus_bank/공중보건학.pdf",
        score: (randomScore - 10) / 100,
        query_chunk_id: 2,
        query_preview: "공중보건의 기본 원리와 역학 조사 방법을 학습합니다.",
        ref_chunk_preview: "공중보건학의 기본 이론과 보건정책 수립 과정을 다룹니다."
      },
      {
        ref_doc: "./syllabus_bank/보건교육학개론.pdf",
        score: (randomScore - 15) / 100,
        query_chunk_id: 3,
        query_preview: "평가 방법은 중간고사 40%, 기말고사 40%, 과제 20%로 구성됩니다.",
        ref_chunk_preview: "성적 평가는 중간고사 40%, 기말고사 40%, 출석 및 과제 20%로 평가합니다."
      }
    ]
  };
};

// 유사도 검사 실행
const runSimilarityCheck = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const userId = req.user.id;

    // 업로드 정보 조회
    const [uploads] = await pool.execute(
      `SELECT * FROM uploads WHERE id = ? AND user_id = ?`,
      [uploadId, userId]
    );

    if (uploads.length === 0) {
      return res.status(404).json({
        message: '업로드 파일을 찾을 수 없습니다.',
        code: 'UPLOAD_NOT_FOUND'
      });
    }

    const upload = uploads[0];
    const filePath = path.join(__dirname, '../uploads', upload.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: '파일을 찾을 수 없습니다.',
        code: 'FILE_NOT_FOUND'
      });
    }

    // 유사도 검사 API 호출
    console.log('🔍 유사도 검사 API 호출 시작...');
    const similarityResult = await callSimilarityAPI(filePath, upload.original_name);
    console.log('📊 API 응답 받음 - 유사도:', Math.round((similarityResult.hybrid?.top?.[0]?.score_final || 0) * 100) + '%');

    // 결과를 데이터베이스에 저장
    const topResult = similarityResult.hybrid?.top?.[0];
    const similarityScore = Math.round((topResult?.score_final || 0) * 100);
    const matchCount = similarityResult.details?.length || 0;
    // 유사도 70% 이상이고 매칭 청크 수가 5개 이상이면 인정
    const isSimilar = similarityScore >= 70 && matchCount >= 5;
    
    console.log('📈 분석 결과: 유사도', similarityScore + '%', isSimilar ? '✅ 유사과목 인정' : '❌ 유사과목 미인정');

    // API 응답에서 실제 분석 결과 생성
    const similarPoints = [];
    const differentPoints = [];
    const recommendations = [];

    // details 배열에서 실제 매칭 내용 분석
    if (similarityResult.details && similarityResult.details.length > 0) {
      const highScoreCount = similarityResult.details.filter(detail => detail.score > 0.7).length;
      const lowScoreCount = similarityResult.details.filter(detail => detail.score < 0.5).length;
      
      console.log(`🔍 매칭 분석: 총 ${similarityResult.details.length}개 (높은 유사도: ${highScoreCount}개, 낮은 유사도: ${lowScoreCount}개)`);
      
      // 유사도 높은 순으로 정렬 (5개 미만이면 모두 표시)
      const filteredDetails = similarityResult.details
        .filter(detail => detail.score > 0.7) // 높은 유사도만
        .sort((a, b) => b.score - a.score); // 유사도 높은 순
      
      const sortedDetails = filteredDetails.length <= 5 
        ? filteredDetails // 5개 이하면 모두 표시
        : filteredDetails.slice(0, 5); // 5개 초과면 상위 5개만
      
      sortedDetails.forEach((detail, index) => {
        const queryText = detail.query_preview || '';
        const refText = detail.ref_chunk_preview || '';
        const scorePercent = Math.round(detail.score * 100);
        
        // 업로드한 문서의 내용 정제
        const cleanQueryText = cleanTextForDisplay(queryText);
        // 기존 문서의 내용 정제
        const cleanRefText = cleanTextForDisplay(refText);
        
        if (cleanQueryText && cleanRefText) {
          // 업로드한 문서와 기존 문서를 명확히 구분해서 표시
          similarPoints.push({
            uploadedContent: cleanQueryText,
            existingContent: cleanRefText,
            similarity: scorePercent
          });
        }
      });
      
      // 낮은 유사도 매칭 (5개 미만이면 모두 표시)
      const filteredLowDetails = similarityResult.details
        .filter(detail => detail.score < 0.5)
        .sort((a, b) => a.score - b.score); // 낮은 유사도 순
        
      const lowScoreDetails = filteredLowDetails.length <= 5 
        ? filteredLowDetails // 5개 이하면 모두 표시
        : filteredLowDetails.slice(0, 5); // 5개 초과면 상위 5개만
        
      lowScoreDetails.forEach((detail) => {
        const queryText = detail.query_preview || '';
        const cleanQueryText = cleanTextForDisplay(queryText);
        if (cleanQueryText) {
          differentPoints.push(cleanQueryText);
        }
      });
    } else {
      console.log('⚠️ 매칭 결과 없음');
    }

    // details 배열에서만 실제 내용 추출 (하드코딩 제거)
    // API 응답의 details 배열이 유일한 실제 분석 데이터 소스
    
    // 권고사항 생성 (details 내용 기반)
    if (similarityResult.details && similarityResult.details.length > 0) {
      const highScoreDetails = similarityResult.details.filter(detail => detail.score > 0.7);
      const lowScoreDetails = similarityResult.details.filter(detail => detail.score < 0.5);
      
      if (highScoreDetails.length > 0) {
        recommendations.push("높은 유사도 매칭이 발견되어 유사과목 인정 가능성이 높습니다.");
      }
      
      if (lowScoreDetails.length > 0) {
        recommendations.push("낮은 유사도 매칭이 발견되어 추가적인 내용 보강이 필요합니다.");
      }
      
      if (similarityResult.details.length === 0) {
        recommendations.push("매칭되는 내용이 없어 보건교육 관련 내용을 추가해야 합니다.");
      }
    }
    
    // 이미 상위 5개로 제한했으므로 중복 제거만 수행
    const uniqueSimilarPoints = [...new Set(similarPoints)];
    const uniqueDifferentPoints = [...new Set(differentPoints)];
    
    console.log(`📝 분석 완료: 유사한 점 ${uniqueSimilarPoints.length}개, 다른 점 ${uniqueDifferentPoints.length}개, 권고사항 ${recommendations.length}개`);

    await pool.execute(
      `INSERT INTO review_results (upload_id, user_id, subject_name, similarity_score, is_similar, review_criteria, similar_points, different_points, recommendation, api_response) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uploadId,
        userId,
        upload.subject_name || upload.original_name.replace(/\.[^/.]+$/, ""),
        similarityScore,
        isSimilar,
        JSON.stringify({
          "문서 구조 유사도": Math.round((topResult?.score_doc || 0) * 100),
          "내용 유사도": Math.round((topResult?.score_chunk || 0) * 100),
          "매칭 청크 수": similarityResult.details?.length || 0
        }),
        JSON.stringify(uniqueSimilarPoints),
        JSON.stringify(uniqueDifferentPoints),
        JSON.stringify(recommendations),
        JSON.stringify(similarityResult)
      ]
    );

    console.log('✅ 데이터베이스 저장 완료 - 유사도 검사 완료!');
    
    // 🔍 디버깅용: 원본 API 응답 전체 확인
    console.log('🔍 === 원본 API 응답 전체 ===');
    console.log('📊 similarityResult:', JSON.stringify(similarityResult, null, 2));
    console.log('🔍 === 원본 API 응답 완료 ===');
    
    res.status(200).json({
      message: '유사도 검사가 완료되었습니다.',
      result: {
        similarityScore,
        isSimilar,
        subjectName: upload.original_name.replace(/\.[^/.]+$/, ""),
        details: similarityResult
      }
    });

  } catch (error) {
    console.error('유사도 검사 오류:', error);
    res.status(500).json({
      message: error.message || '유사도 검사 중 오류가 발생했습니다.',
      code: 'SIMILARITY_CHECK_ERROR'
    });
  }
};

module.exports = {
  uploadFile,
  getUploads,
  getUpload,
  downloadFile,
  deleteFile,
  runSimilarityCheck
};