// KakaoAgreeModal.tsx
import React from 'react';
import { Modal, Button, Checkbox, Form, Toast } from '@douyinfe/semi-ui';

interface KakaoAgreeModalProps {
  visible: boolean;
  onClose: () => void;
  onAgree: (userData: any) => void;
  kakaoData: any;
}

const KakaoAgreeModal = ({ visible, onClose, onAgree, kakaoData }: KakaoAgreeModalProps) => {
  const handleSubmit = (values: any) => {
    if (!values.agreeTerms) {
      Toast.error('서비스 이용약관에 동의해주세요');
      return;
    }
    if (!values.agreePrivacy) {
      Toast.error('개인정보 처리방침에 동의해주세요');
      return;
    }

    onAgree({
      ...kakaoData,
      agreeTerms: true,
      agreePrivacy: true,
      agreeMarketing: values.agreeMarketing || false
    });
  };

  return (
    <Modal
      title="푸딩이지 서비스 이용 동의"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <h3>카카오 계정으로 가입</h3>
          <p>이메일: {kakaoData?.email}</p>
          <p>닉네임: {kakaoData?.nickname}</p>
        </div>

        <Form.Checkbox
          field="agreeTerms"
          noLabel
          rules={[{ required: true, message: '서비스 이용약관 동의는 필수입니다' }]}
        >
          [필수] 서비스 이용약관 동의
        </Form.Checkbox>
        <a href="/terms" target="_blank" style={{ marginLeft: 24, fontSize: 12 }}>자세히 보기</a>

        <Form.Checkbox
          field="agreePrivacy"
          noLabel
          rules={[{ required: true, message: '개인정보 처리방침 동의는 필수입니다' }]}
        >
          [필수] 개인정보 처리방침 동의
        </Form.Checkbox>
        <a href="/privacy" target="_blank" style={{ marginLeft: 24, fontSize: 12 }}>자세히 보기</a>

        <Form.Checkbox field="agreeMarketing" noLabel>
          [선택] 마케팅 정보 수신 동의
        </Form.Checkbox>

        <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button type="secondary" onClick={onClose}>취소</Button>
          <Button type="primary" htmlType="submit">동의하고 가입하기</Button>
        </div>
      </Form>
    </Modal>
  );
};

export default KakaoAgreeModal;