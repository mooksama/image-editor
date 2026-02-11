import styles from './login-register.module.less';
import React, { useState, useEffect } from 'react';
import { Modal } from '@douyinfe/semi-ui';
import LoginRegisterBox from './loginRegisterBox/LoginRegisterBox';
import { user } from '@stores/user';
import { pubsub } from '@utils/index';
import { Close } from '@icon-park/react';

function LoginRegister({ children }: any) {
  const [visible, setVisible] = useState(false);

  const showVisible = () => {
    if (!user.info) {
      setVisible(true);
    } else {
      console.log(user.info); 
      // history.push(location.pathname);
    }
  };
  const handleLoginSuccess = (userData: any) => {
    // 로그인 성공 시 처리
    user.setUserInfo(userData);  // user store에 정보 저장
    setVisible(false);  // 모달 닫기
    // 필요한 경우 페이지 새로고침이나 상태 업데이트
    // window.location.reload();
  };

  useEffect(() => {
    pubsub.subscribe('showLoginModal', (_eventName: string, mark: boolean) => {
      if (mark !== undefined) {
        setVisible(mark);
      } else {
        setVisible(true);
      }
    });
    return () => {
      pubsub.unsubscribe('showLoginModal');
    };
  }, []);

  return (
    <div className={styles.loginRegister}>
      {children ? (
        <span onClick={showVisible}>{children}</span>
      ) : (
        <a onClick={showVisible} className={styles.loginRegisterBtn}>
          로그인/회원가입
        </a>
      )}
      <Modal
        className="loginRegisterModal"
        style={{ padding: 0 }}
        bodyStyle={{ padding: 0, margin: 0, border: 'none' }}
        title={null}
        width={400}
        visible={visible}
        zIndex={1000}
        footer={null}
        closeIcon={<Close />}
        onCancel={() => setVisible(false)}
      >
        {visible && <LoginRegisterBox onLoginSuccess={handleLoginSuccess}/>}
      </Modal>
    </div>
  );
}

export default LoginRegister;
