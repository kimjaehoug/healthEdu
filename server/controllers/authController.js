const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { pool } = require('../config/database');

// 회원가입
const register = async (req, res) => {
  try {
    // 입력값 검증
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: '입력값이 올바르지 않습니다.',
        errors: errors.array()
      });
    }

    const { email, password, name, organization, position, phone } = req.body;

    // 이메일 중복 확인
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: '이미 등록된 이메일입니다.',
        code: 'EMAIL_EXISTS'
      });
    }

    // 비밀번호 암호화
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 사용자 등록
    const [result] = await pool.execute(
      `INSERT INTO users (email, password, name) 
       VALUES (?, ?, ?)`,
      [email, hashedPassword, name]
    );

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      token,
      user: {
        id: result.insertId,
        email,
        name,
        role: 'user'
      }
    });

  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({
      message: '서버 오류가 발생했습니다.',
      code: 'SERVER_ERROR'
    });
  }
};

// 로그인
const login = async (req, res) => {
  try {
    console.log('로그인 요청 받음:', { email: req.body.email });
    
    // 입력값 검증
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('입력값 검증 실패:', errors.array());
      return res.status(400).json({
        message: '입력값이 올바르지 않습니다.',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // 사용자 조회
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    console.log('사용자 조회 결과:', users.length > 0 ? '사용자 발견' : '사용자 없음');

    if (users.length === 0) {
      console.log('사용자를 찾을 수 없음:', email);
      return res.status(401).json({
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const user = users[0];

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('비밀번호 확인 결과:', isPasswordValid ? '성공' : '실패');
    
    if (!isPasswordValid) {
      console.log('비밀번호가 일치하지 않음');
      return res.status(401).json({
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // 마지막 로그인 시간 업데이트 (컬럼이 있는 경우에만)
    try {
      await pool.execute(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );
    } catch (error) {
      // last_login 컬럼이 없는 경우 무시
      console.log('last_login 컬럼이 없어서 업데이트를 건너뜁니다.');
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('로그인 성공, 토큰 생성 완료');
    
    res.json({
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      message: '서버 오류가 발생했습니다.',
      code: 'SERVER_ERROR'
    });
  }
};

// 사용자 정보 조회
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.execute(
      'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: '사용자를 찾을 수 없습니다.',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      user: users[0]
    });

  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({
      message: '서버 오류가 발생했습니다.',
      code: 'SERVER_ERROR'
    });
  }
};

// 비밀번호 변경
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: '입력값이 올바르지 않습니다.',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 현재 사용자 정보 조회
    const [users] = await pool.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: '사용자를 찾을 수 없습니다.',
        code: 'USER_NOT_FOUND'
      });
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: '현재 비밀번호가 올바르지 않습니다.',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // 새 비밀번호 암호화
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 비밀번호 업데이트
    await pool.execute(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, userId]
    );

    res.json({
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });

  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    res.status(500).json({
      message: '서버 오류가 발생했습니다.',
      code: 'SERVER_ERROR'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  changePassword
};