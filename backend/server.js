// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const svgCaptcha = require('svg-captcha');
require('dotenv').config();
const app = express();

// preflight 요청을 위한 OPTIONS 핸들링
app.use(express.json());  // JSON 파싱
app.use(express.urlencoded({ extended: true }));  // URL-encoded 파싱

// 모든 요청에 대해 CORS 허용
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');  // 모든 도메인 허용
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  // preflight 요청 처리
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    if (req.method === 'POST') {
      console.log('요청 본문:', req.body);
    }
    next();
  }
});

// cors 미들웨어 설정
app.use(cors({
  origin: '*',  // 모든 도메인 허용
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
url = "mongodb://mooksama:just9itnow!@61.111.38.9:27017/pooding?authSource=admin";
// JWT 시크릿 키 (환경 변수로 관리하는 것을 권장)
const JWT_SECRET = process.env.JWT_SECRET;

// MongoDB 연결
mongoose.connect( url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB 연결 성공');
}).catch((err) => {
  console.error('MongoDB 연결 실패:', err);
});;
 

// 사용자 모델
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  nickname: { type: String },
  profileImage: { type: String },
  phoneNumber: { type: String },
  provider: { type: String, enum: ['local', 'kakao'], default: 'local' },
  kakaoId: { type: String, sparse: true },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  agreeTerms: { type: Boolean, default: false },
  agreePrivacy: { type: Boolean, default: false },
  agreeMarketing: { type: Boolean, default: false },
  agreedAt: { type: Date }
});
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
// 인덱스 추가
 
// 캡차 저장소 (실제 프로덕션에서는 Redis 사용 권장)
const captchaStore = new Map();


// 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = req.headers['authorization'].split(' ')[1];
  // console.log("token", token);

  if (!token) {
    return res.json({
      code: 401,
      data: null,
      message: '인증 토큰이 필요합니다'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.json({
        code: 403,
        data: null,
        message: '유효하지 않은 토큰입니다'
      });
    }
    req.user = user;
    next();
  });
};


// 캡차 생성 엔드포인트
app.get('/api/v1/account/captcha', (req, res) => {
  try {
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
      code: 0,
      data: {
        captcha_key: captchaKey,
        captcha_code: captcha.data
      },
      message: 'success'
    });
  } catch (error) {
    res.json({
      code: 500,
      data: null,
      message: '캡차 생성 중 오류가 발생했습니다'
    });
  }
});

// 이메일 중복 확인 엔드포인트
app.get('/api/v1/account/check-email', async (req, res) => {
  try {
    const email = req.query.email;
    const existingUser = await User.findOne({ email });
    console.log("existingUser", existingUser);
    // 기존 코드 형식에 맞춰 응답 구조 변경
    res.json({
      code: 0,  // 성공 코드
      data: {
        exists: !!existingUser
      },
      message: 'success'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      data: null,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// 회원가입 엔드포인트
app.post('/api/v1/account/register', async (req, res) => {
  try {
    const { username, password, captchaCode } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email: username });
    if (existingUser) {
      return res.json({
        code: 400,
        data: null,
        message: '이미 등록된 이메일입니다'
      });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = new User({
      email: username,
      password: hashedPassword
    });

    await user.save();

    res.json({
      code: 0,
      data: {
        id: user._id,
        email: user.email
      },
      message: '회원가입이 완료되었습니다'
    });
  } catch (error) {
    res.json({
      code: 500,
      data: null,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// 로그인 엔드포인트
app.post('/api/v1/account/login', async (req, res) => {
  try {
    const { username, password, type } = req.body;

    const user = await User.findOne({ email: username });
    if (!user) {
      return res.json({
        code: 400,
        data: null,
        message: '이메일 또는 비밀번호가 잘못되었습니다'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.json({
        code: 400,
        data: null,
        message: '이메일 또는 비밀번호가 잘못되었습니다'
      });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      code: 0,
      data: {
        token: `Bearer ${token}`,  // Bearer 접두사 추가
        user: {
          id: user._id,
          email: user.email
        }
      },
      message: '로그인 성공'
    });
  } catch (error) {
    res.json({
      code: 500,
      data: null,
      message: '서버 오류가 발생했습니다'
    });
  }
});


app.get('/api/v1/account/check-kakao-user', async (req, res) => {
  try {
    const { kakaoId } = req.query;
    const user = await User.findOne({ kakaoId });
    
    res.json({
      code: 0,
      data: {
        exists: !!user
      },
      message: 'success'
    });
  } catch (error) {
    res.json({
      code: 500,
      data: null,
      message: '사용자 확인 중 오류가 발생했습니다'
    });
  }
});

app.post('/api/v1/account/kakao-login', async (req, res) => {
  try {
    const { kakaoId, email, nickname, profileImage, phoneNumber } = req.body;

    // 카카오 ID로 기존 사용자 검색
    let user = await User.findOne({ kakaoId });

    if (!user) {
      // 새 사용자 생성
      user = new User({
        kakaoId,
        email: email || `kakao_${kakaoId}@kakao.com`, // 이메일이 없는 경우 대체 이메일
        nickname,
        profileImage,
        phoneNumber,
        provider: 'kakao'
      });
      await user.save();
    }

    // JWT 토큰 생성
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      code: 0,
      data: {
        token: `Bearer ${token}`,
        user: {
          id: user._id,
          email: user.email,
          nickname: user.nickname,
          profileImage: user.profileImage
        }
      },
      message: '카카오 로그인 성공'
    });
  } catch (error) {
    console.error('카카오 로그인 에러:', error);
    res.json({
      code: 500,
      data: null,
      message: '카카오 로그인 중 오류가 발생했습니다'
    });
  }
});
// 사용자 정보 조회 엔드포인트
app.get('/api/v1/account/info', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
        .select('-password');  // 비밀번호 필드 제외;
    console.log("user", user);  

    if (!user) {
      return res.json({
        code: 404,
        data: null,
        message: '사용자를 찾을 수 없습니다'
      });
    }

    res.json({
      code: 0,
      data: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        isActive: user.isActive
      },
      message: 'success'
    });
  } catch (error) {
    res.json({
      code: 500,
      data: null,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// 로그아웃 엔드포인트
app.get('/api/v1/account/logout', authenticateToken, (req, res) => {
  res.json({
    code: 0,
    data: null,
    message: '로그아웃 성공'
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
});