// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const svgCaptcha = require('svg-captcha');

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect('mongodb://localhost:27017/poodingez', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 사용자 모델
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

// 캡차 저장소 (실제 프로덕션에서는 Redis 사용 권장)
const captchaStore = new Map();

// JWT 시크릿 키 (환경 변수로 관리하는 것을 권장)
const JWT_SECRET = 'your-secret-key';

// 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '유효하지 않은 토큰입니다' });
    }
    req.user = user;
    next();
  });
};

// 캡차 생성 엔드포인트
app.get('/api/v1/account/captcha', (req, res) => {
  const captcha = svgCaptcha.create({
    size: 6,
    noise: 2,
    color: true
  });

  const captchaKey = Date.now().toString();
  captchaStore.set(captchaKey, captcha.text);

  // 5분 후 캡차 삭제
  setTimeout(() => {
    captchaStore.delete(captchaKey);
  }, 5 * 60 * 1000);

  res.json({
    success: true,
    data: {
      captcha_key: captchaKey,
      captcha_code: captcha.data // SVG 문자열
    }
  });
});

// 이메일 중복 확인 엔드포인트
app.get('/api/v1/account/check-email', async (req, res) => {
  try {
    const email = req.query.email;
    const existingUser = await User.findOne({ email });
    res.json({ exists: !!existingUser });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

// 회원가입 엔드포인트
app.post('/api/v1/account/register', async (req, res) => {
  try {
    const { username, password, captchaCode } = req.body;

    // 캡차 검증
    const storedCaptcha = captchaStore.get(captchaCode);
    if (!storedCaptcha) {
      return res.status(400).json({ message: '잘못되거나 만료된 캡차입니다' });
    }
    captchaStore.delete(captchaCode);

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email: username });
    if (existingUser) {
      return res.status(400).json({ message: '이미 등록된 이메일입니다' });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = new User({
      email: username,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다'
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

// 로그인 엔드포인트
app.post('/api/v1/account/login', async (req, res) => {
  try {
    const { username, password, type } = req.body;

    // 사용자 찾기
    const user = await User.findOne({ email: username });
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다' });
    }

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다' });
    }

    // JWT 토큰 생성
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

// 사용자 정보 조회 엔드포인트
app.get('/api/v1/account/info', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

// 로그아웃 엔드포인트
app.get('/api/v1/account/logout', authenticateToken, (req, res) => {
  // JWT는 클라이언트 측에서 제거되므로, 서버에서는 특별한 처리가 필요 없음
  res.json({ success: true, message: '로그아웃되었습니다' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
});