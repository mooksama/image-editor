import BasicService from './BasicService';
import { user } from '@stores/user';
import { util } from '@utils/index';

const _window = window as any;

/**
 * @desc 테스트용
 */
class UserService extends BasicService {
  constructor() {
    super();
    // 토큰 저장
    if (user.token) {
      super._setRqHeaderToken(user.token);
    }
  }

  // // 유형 구성 가져오기
  // getTypeTree = async () => {
  //   return await this.get(`/api/v1/common/types/tree`);
  // };

  // // 로그인 QR 코드 가져오기
  // getWxQrcode = async () => {
  //   return await this.get(`/api/v1/account/login/wqr`);
  // };

  // // 사용자가 QR 코드를 통해 팔로우했는지 확인
  // seekWxLogin = async (sn: string) => {
  //   return await this.get(`/api/v1/account/login/wset?sn=${sn}`);
  // };

  // // 휴대폰 인증 코드 가져오기
  // getRegisterSMS = async (data: any) => {
  //   return await this.post(`/api/v1/account/sms/register`, data);
  // };

  // // 로그인 휴대폰 인증 코드 가져오기
  // getLoginSMS = async (data: any) => {
  //   return await this.post(`/account/sms/login`, data);
  // };


  // // WeChat 바인딩 - QR 코드 가져오기
  // getBindWeixinCode = async () => {
  //   return await this.get('/api/v1/account/bind-weixin/wqr');
  // };

  // // WeChat 바인딩 - 결과 폴링
  // bindWeixinSeek = async (sn: string) => {
  //   return await this.get('/api/v1/account/bind-weixin/wset?sn=' + sn);
  // };

  // 캡차 가져오기
  getCaptcha = async () => {
    return await this.get(`/api/v1/account/captcha`);
  }; 
  // 이메일 중복 체크
  checkEmailExists = async (email: string) => {
    return await this.get(`/api/v1/account/check-email?email=${email}`);
  };
  // 이메일 인증 코드 보내기
  sendEmailCode = async (data: any) => {
    return await this.post(`/api/v1/account/mail/register`, data);
  };

  // 이메일 바인딩
  bindEmail = async (data: any) => {
    return await this.post(`/api/v1/account/mail/bind-email`, data);
  };

  // // 휴대폰 번호 바인딩 phoneNumber, code
  // bindPhone = async (data: { phoneNumber: string; code: string }) => {
  //   return await this.post(`/api/v1/account/bind-mobile`, data);
  // };

  // // 휴대폰 번호 바인딩, 인증 코드 보내기 mobile captchaCode
  // getCodeBindMobile = async (data: { mobile: string; captchaCode: string }) => {
  //   return await this.post(`/api/v1/account/sms/bind-mobile`, data);
  // };

  // // 비밀번호 찾기 휴대폰 인증 코드 보내기 mobile captchaCode
  // getCodeResetPassword = async (data: { mobile: string; captchaCode: string; captchaKey: string }) => {
  //   return await this.post(`/api/v1/account/sms/recover-password`, data);
  // };

  
  // 카카오 회원가입이 되어있는지 확인
  checkKakaoUser = async (kakaoId: string) => {
    try {
      const [res, err] = await this.get(`/api/v1/account/check-kakao-user?kakaoId=${kakaoId}`);
      if (err) {
        return [null, err];
      }
      return [res, null];
    } catch (error) {
      return [null, '카카오 사용자 확인 중 오류가 발생했습니다'];
    }
  };
  kakaoLogin = async (kakaoData: {
    kakaoId: string;
    nickname: string;
    profileImage: string;
    phoneNumber: string;
    accessToken: string;
  }) => {
    try {
      const [res, err] = await this.post('/api/v1/account/kakao-login', kakaoData);
      if (err) {
        return [null, err];
      }
      return [res, null];
    } catch (error) {
      return [null, '카카오 로그인 중 오류가 발생했습니다'];
    }
  };
  /**
   * 등록
   * @param {*} registerInfo
   */
  register = async (registerInfo: { username: string; password: string; captchaCode: string }) => {
    try {
      // 이메일 중복 체크
      const [existsRes, existsErr] = await this.checkEmailExists(registerInfo.username);
      if (existsErr) {
        return [null, existsErr];
      }
      if (existsRes?.exists) {
        return [null, '이미 사용중인 이메일입니다'];
      }

      // 회원가입 요청
      const [res, err] = await this.post(`/api/v1/account/register`, registerInfo);
      if (err) {
        return [null, err];
      }

      return [res, null];
    } catch (error: any) {
      return [null, error.message || '회원가입 중 오류가 발생했습니다'];
    }
  };

  // // 앱 통계 데이터 가져오기
  // getStatistics = async () => {
  //   return await this.get(`/api/v1/open/app-statistics`);
  // };

  // 로그인
  login = async (params: {
    username: string;
    password: string;
    type: string;
  }) => {
    try {
      const [res, err] = await this.post(`/api/v1/account/login`, params);
      if (res) {
        this._setRqHeaderToken(res.token);
        user.setToken(res.token);
      }
      return [res, err];
    } catch (error: any) {
      return [null, error.message || '로그인 중 오류가 발생했습니다'];
    }
  };
  
  // 체크인 데이터 가져오기
  userSign = async () => {
    let stDate = util.formatDate(+new Date(), 'YYYY-MM-DD');
    return await this.get('/api/v1/api/user-sign?stDate=' + stDate);
  };

  // 체크인
  doUserSign = async () => {
    return await this.post('/api/v1/api/user-sign');
  };

  oauthLogin = async (code: string) => {
    const [res] = await this.get('/api/v1/account/login/provider/qq/user', { params: { code } });
    if (res) {
      this._setRqHeaderToken(res.token);
      user.setToken(res.token);
      user.setUserInfo(res.user);
      return res;
    } else {
      return false;
    }
  };

  // 로그아웃
  logout = async () => {
    const res = await this.get(`/api/v1/account/logout`);
    user.clearUserInfo();
    _window.RouterHistory.push('/');
    return res;
  };

  /**
   * 사용자 정보 업데이트
   * @param {*} userInfo
   */
  updateUserInfo = async (userInfo: any) => {
    return await this.put('/api/v1/account/update', userInfo);
  };

  /**
   * 비밀번호 변경
   */
  changePassword = async (data: { username: string; password: string; captchaCode: string }) => {
    return await this.post('/api/v1/account/change-password', data);
  };

  /**
   * 비밀번호 찾기
   * @param {*} data
   */
  findPassword = async (data: { mobile: string; password: string; code: string }) => {
    return await this.post('/api/v1/account/recover-password', data);
  };

  /**
   * 사용자 정보 가지고 오기
   */
  getUserDetail = async () => {
    try {
      const [res, err] = await this.get('/api/v1/account/info');
      if (err) {
        console.error('로그인 실패');
        user.logout();
        return [null, err];
      }
      user.setUserInfo(res);
      return [res, null];
    } catch (error: any) {
      return [null, error.message || '사용자 정보를 가져오는 중 오류가 발생했습니다'];
    }
  };
}

export const userService = new UserService();
