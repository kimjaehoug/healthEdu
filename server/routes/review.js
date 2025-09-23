const express = require('express');
const { body } = require('express-validator');
const { 
  requestReview, 
  getReviewResult, 
  getUserReviews, 
  getReviewCriteria,
  deleteReview
} = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 심사 요청
router.post('/request', [
  body('uploadId')
    .isInt({ min: 1 })
    .withMessage('올바른 업로드 ID를 입력해주세요.'),
  body('subjectName')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('과목명은 2-255자 사이여야 합니다.')
], requestReview);

// 특정 심사 결과 조회
router.get('/result/:uploadId', getReviewResult);

// 사용자의 모든 심사 결과 조회
router.get('/my-reviews', getUserReviews);

// 심사 기준 조회
router.get('/criteria', getReviewCriteria);

// 심사 결과 삭제
router.delete('/:reviewId', deleteReview);

module.exports = router;