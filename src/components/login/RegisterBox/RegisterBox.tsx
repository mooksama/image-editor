import React from 'react';
import { withRouter } from 'react-router-dom';
import { Card, Button, Form, Toast } from '@douyinfe/semi-ui';

function RegisterBox() {
  const handleRegister = (values: any) => {
    // 비밀번호 확인 검증
    if (values.password !== values.confirmPassword) {
      Toast.error('비밀번호가 일치하지 않습니다');
      return;
    }

    // TODO: 회원가입 API 호출
    console.log('Register values:', values);
    Toast.success('회원가입이 완료되었습니다');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--semi-color-bg-0)' }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>회원가입</h1>
        </div>
        
        <Form onSubmit={handleRegister}>
          <Form.Input
            field="email"
            label="이메일"
            placeholder="이메일을 입력하세요"
            rules={[
              { required: true, message: '이메일을 입력해주세요' },
              { type: 'email', message: '올바른 이메일 형식을 입력해주세요' }
            ]}
            style={{ marginBottom: 12 }}
          />
          
          <Form.Input
            field="password"
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력하세요"
            rules={[
              { required: true, message: '비밀번호를 입력해주세요' },
              { min: 8, message: '비밀번호는 최소 8자 이상이어야 합니다' }
            ]}
            style={{ marginBottom: 12 }}
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
          />
          
          <Button theme="solid" type="primary" htmlType="submit" style={{ width: '100%', marginBottom: 16 }}>
            가입하기
          </Button>
        </Form>
        
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--semi-color-text-2)' }}>
          이미 계정이 있으신가요?{' '}
          <a href="/login" style={{ color: 'var(--semi-color-primary)' }}>
            로그인
          </a>
        </div>
      </Card>
    </div>
  );
}

export default withRouter(RegisterBox);