import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Card, Button, Form, Toast, Divider } from '@douyinfe/semi-ui';
import KakaoLogin from "react-kakao-login";
import { authService } from '@/services/authService';
import { user } from '@stores/user'; // MobX store import
import { pubsub } from '@utils/index'; // pubsub import

function LoginRegisterBox() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const kakaoClientId = '53cf52fb912b1b8962d7f47fe33ab558';
  
const kakaoOnSuccess = async (data: any) => {
  console.log(data);
  const accessToken = data.response.access_token;
  const profile = data.profile;
  try {
    const idToken = profile.id;
    const name = profile.properties.nickname;
    const email = profile.kakao_account?.email || '';

    if (accessToken) {
      // localStorage에 저장
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('auth_user', JSON.stringify({
        id: idToken,
        name: name,
        email: email,
      }));
      
      // MobX store에 저장
      user.setToken(accessToken);
      user.setUserInfo({
        id: idToken,
        nick_name: name,
        email: email,
        avatar: profile.properties?.profile_image || '',
        vip_status: 0,
      });
      
      Toast.success('카카오 로그인 성공!');
      
      pubsub.publish('showLoginModal', false);
      
      setTimeout(() => {
        (window as any).RouterHistory.push('/');
      }, 500);
    }
  } catch (error) {
    Toast.error('로그인 실패');
    console.error('카카오 로그인 에러:', error);
  }
};

  const kakaoOnFailure = (error: any) => {
    console.error('카카오 로그인 에러:', error);
    Toast.error('카카오 로그인 실패');
  };

  // 이메일 로그인
  const handleEmailLogin = async (values: any) => {
    setLoading(true);
    try {
      const result = await authService.login({
        email: values.email,
        password: values.password,
      });
      
      // authService.login()에서 이미 localStorage에 저장함
      // 추가로 MobX store 업데이트
      if (result.content?.token) {
        user.setToken(result.content.token);
      }
      
      if (result.content?.user) {
        user.setUserInfo({
          id: result.content.user.id,
          nick_name: result.content.user.name,
          email: result.content.user.email,
          avatar: '',
          vip_status: 0,
        });
      }
      
      Toast.success(`${result.content?.user?.name}님 환영합니다!`);
      
      pubsub.publish('showLoginModal', false);
      
      setTimeout(() => {
        (window as any).RouterHistory.push('/');
      }, 1000);
      
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : '로그인 실패');
      console.error('로그인 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  // 회원가입
  const handleRegister = async (values: any) => {
    if (values.password !== values.confirmPassword) {
      Toast.error('비밀번호가 일치하지 않습니다');
      return;
    }
    
    setLoading(true);
    try {
      const name = values.name || values.email.split('@')[0];
      
      const result = await authService.register({
        email: values.email,
        password: values.password,
        name: name,
      });
      
      Toast.success('회원가입이 완료되었습니다');
      setIsLoginMode(true); // 로그인 화면으로 전환
      
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : '회원가입 실패');
      console.error('회원가입 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--semi-color-bg-0)' }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>푸딩이지 POODING EZ</h1>
          <h2 style={{ fontSize: 18 }}>{isLoginMode ? '로그인' : '회원가입'}</h2>
        </div>
        
        {isLoginMode ? (
          // 로그인 폼
          <>
            <Form onSubmit={handleEmailLogin}>
              <Form.Input
                field="email"
                label="이메일"
                placeholder="이메일을 입력하세요"
                rules={[
                  { required: true, message: '이메일을 입력해주세요' },
                  { type: 'email', message: '올바른 이메일 형식을 입력해주세요' }
                ]}
                style={{ marginBottom: 12 }}
                disabled={loading}
              />
              
              <Form.Input
                field="password"
                label="비밀번호"
                type="password"
                placeholder="비밀번호를 입력하세요"
                rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
                style={{ marginBottom: 16 }}
                disabled={loading}
              />
              
              <Button 
                theme="solid" 
                type="primary" 
                htmlType="submit" 
                style={{ width: '100%', marginBottom: 16 }}
                loading={loading}
              >
                로그인
              </Button>
            </Form>
            
            <Divider margin='12px'>다른 로그인 방식</Divider>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <KakaoLogin
                token={kakaoClientId}
                onSuccess={kakaoOnSuccess}
                onFail={kakaoOnFailure}
                render={({ onClick }) => (
                  <Button
                    theme="solid"
                    style={{ 
                      backgroundColor: '#FEE500', 
                      color: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={onClick}
                    disabled={loading}
                    icon={
                      <svg width="18" height="18" viewBox="0 0 18 18">
                        <g fill="none">
                          <path 
                            fill="#000000" 
                            d="M9 1.5C4.58375 1.5 1 4.30262 1 7.75262C1 10.1006 2.55938 12.1546 4.93188 13.2526L3.89563 16.8771C3.84625 17.0366 3.985 17.1901 4.13688 17.1071L8.49063 14.2641C8.65813 14.2846 8.82875 14.2951 9 14.2951C13.4162 14.2951 17 11.4926 17 8.04262C17 4.59262 13.4162 1.5 9 1.5Z"
                          />
                        </g>
                      </svg>
                    }
                  >
                    카카오톡으로 로그인
                  </Button>
                )}
              />
              
              <Button
                theme="light"
                icon={<i className="semi-icon-phone" style={{ marginRight: 8 }}></i>}
                onClick={() => window.location.href = '/phone-login'}
                disabled={loading}
              >
                휴대폰 로그인
              </Button>
            </div>
          </>
        ) : (
          // 회원가입 폼
          <Form onSubmit={handleRegister}>
            <Form.Input
              field="name"
              label="이름"
              placeholder="이름을 입력하세요"
              rules={[{ required: true, message: '이름을 입력해주세요' }]}
              style={{ marginBottom: 12 }}
              disabled={loading}
            />
            
            <Form.Input
              field="email"
              label="이메일"
              placeholder="이메일을 입력하세요"
              rules={[
                { required: true, message: '이메일을 입력해주세요' },
                { type: 'email', message: '올바른 이메일 형식을 입력해주세요' }
              ]}
              style={{ marginBottom: 12 }}
              disabled={loading}
            />
            
            <Form.Input
              field="password"
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요 (최소 8자)"
              rules={[
                { required: true, message: '비밀번호를 입력해주세요' },
                { min: 8, message: '비밀번호는 최소 8자 이상이어야 합니다' }
              ]}
              style={{ marginBottom: 12 }}
              disabled={loading}
            />

            <Form.Input
              field="confirmPassword"
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              rules={[
                { required: true, message: '비밀번호 확인을 입력해주세요' },
                { min: 8, message: '비밀번호는 최소 8자 이상이어야 합니다' }
              ]}
              style={{ marginBottom: 16 }}
              disabled={loading}
            />
            
            <Button 
              theme="solid" 
              type="primary" 
              htmlType="submit" 
              style={{ width: '100%', marginBottom: 16 }}
              loading={loading}
            >
              가입하기
            </Button>
          </Form>
        )}
        
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--semi-color-text-2)' }}>
          {isLoginMode ? (
            <>
              계정이 없으신가요?{' '}
              <a onClick={() => setIsLoginMode(false)} style={{ color: 'var(--semi-color-primary)', cursor: 'pointer' }}>
                회원가입
              </a>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{' '}
              <a onClick={() => setIsLoginMode(true)} style={{ color: 'var(--semi-color-primary)', cursor: 'pointer' }}>
                로그인
              </a>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

export default withRouter(LoginRegisterBox);