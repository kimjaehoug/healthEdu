const express = require('express');
const { body } = require('express-validator');
const { register, login, getProfile, changePassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 회원가입
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('올바른 이메일 형식이 아닙니다.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('비밀번호는 최소 8자 이상이어야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('이름은 2-50자 사이여야 합니다.'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('소속 기관명은 255자를 초과할 수 없습니다.'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('직책은 100자를 초과할 수 없습니다.'),
  body('phone')
    .optional()
    .matches(/^[0-9-+\s()]+$/)
    .withMessage('올바른 전화번호 형식이 아닙니다.')
], register);

// 로그인
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('올바른 이메일 형식이 아닙니다.'),
  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요.')
], login);

// 사용자 정보 조회 (인증 필요)
router.get('/profile', authenticateToken, getProfile);

// 비밀번호 변경 (인증 필요)
router.put('/change-password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('현재 비밀번호를 입력해주세요.'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('새 비밀번호는 최소 8자 이상이어야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('새 비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.')
], changePassword);

module.exports = router;