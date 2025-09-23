const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// JWT 토큰 검증 미들웨어
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: '접근 토큰이 필요합니다.',
        code: 'TOKEN_REQUIRED'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 사용자 정보 조회
    const [users] = await pool.execute(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        message: '유효하지 않은 토큰입니다.',
        code: 'INVALID_TOKEN'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: '유효하지 않은 토큰입니다.',
        code: 'INVALID_TOKEN'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: '토큰이 만료되었습니다.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('토큰 검증 오류:', error);
    return res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      code: 'SERVER_ERROR'
    });
  }
};

// 관리자 권한 확인 미들웨어
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: '관리자 권한이 필요합니다.',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
};

// 심사자 권한 확인 미들웨어
const requireReviewer = (req, res, next) => {
  if (!['admin', 'reviewer'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: '심사자 권한이 필요합니다.',
      code: 'REVIEWER_REQUIRED'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireReviewer
};