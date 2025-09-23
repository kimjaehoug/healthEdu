const express = require('express');
const { uploadFile, getUploads, getUpload, downloadFile, deleteFile, runSimilarityCheck } = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 파일 업로드
router.post('/', uploadSingle, handleUploadError, uploadFile);

// 업로드된 파일 목록 조회
router.get('/', getUploads);

// 특정 업로드 파일 조회
router.get('/:uploadId', getUpload);

// 파일 다운로드
router.get('/:uploadId/download', downloadFile);

// 파일 삭제
router.delete('/:uploadId', deleteFile);

// 유사도 검사 실행
router.post('/:uploadId/similarity-check', runSimilarityCheck);

module.exports = router;