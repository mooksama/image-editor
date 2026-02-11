import styles from './login-mobile.module.less';
import React, { useEffect, useState, useRef } from 'react';
import { Form, Input, Button, Row, Col, Divider, Toast } from '@douyinfe/semi-ui';
import { userService } from '@server/index';
import { pubsub } from '@utils/index';
function LoginMobile({ setShow }: any) {
  const [captcha, setCaptcha] = useState({
    key: '',
    code: '',
  });
  const formRef = useRef<any>();
  const formApiRef = useRef<any>();
  const timer = useRef<any>();
  const [time, setTime] = useState(60);

  const onFinish = async (values: any) => {
    // 1. 로그인 성공 후 자동으로 x-token 설정
    // const res = await userService.login({ ...values, captchaKey: captcha.key });
    const [res, err] = await userService.login({
      mobile: values.telphone,
      code: values.phoneCode,
      type: 'mobile_code',
    });

    if (res) {
      Toast.success('로그인 성공!');
    } else {
      Toast.error(err);
    }
    if (err) {
      // 캡차 변경
      getImageKey();
      return;
    }
    // 2. 사용자 세부 정보 가져오기, x-user-info 설정
    const [userRes, userError] = await userService.getUserDetail();
    if (userRes) {
      (window as any).RouterHistory.push('./manage');
      pubsub.publish('showLoginModal', false);
    }
  };
  useEffect(() => {
    getImageKey();
  }, []);

  const getImageKey = async () => {
    const [res, err] = await userService.getCaptcha();
    console.log(res);
    if (res) {
      setCaptcha({
        code: res.captcha_code,
        key: res.captcha_key,
      });
    }
  };

  const getFormApi = formApi => {
    formApiRef.current = formApi;
  };

  // SMS 전송
  const sendSMS = async () => {
    console.log('formApiRef.current', formApiRef.current);
    const { telphone, captchaCode } = formApiRef.current.getValues();
    console.log('formApiRef.current', formApiRef.current.getValues());
    if (!/^1\d{10}$/.test(telphone)) {
      Toast.error('올바른 전화번호를 입력하세요');
      return;
    }
    if (!captchaCode) {
      Toast.error({ content: '캡차 코드를 입력하세요', duration: 10000 });
      return;
    }
    // 인증 코드 전송
    const [res, err] = await userService.getLoginSMS({
      mobile: telphone,
      captchaCode: captchaCode,
      captchaKey: captcha.key,
    });
    if (res) {
      Toast.success('인증 코드가 전송되었습니다. 확인하세요');
    } else {
      Toast.error(err);
    }

    let t = 60;
    timer.current = setInterval(() => {
      if (t - 1 === 0) {
        clearInterval(timer.current);
        setTime(60);
        return;
      }
      t--;
      setTime(t);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, []);

  return (
    <div className={styles.loginMobile}>
      <p className={styles.title}>
        <span className={styles.text}>휴대폰 로그인</span>
      </p>
      <Form name="basic" ref={formRef} getFormApi={getFormApi} onSubmit={onFinish}>
        <Row gutter={8} className={styles.fromItem}>
          <Col span={24}>
            <Form.Input
              noLabel
              field="telphone"
              rules={[{ required: true, message: '전화번호를 입력하세요' }]}
              placeholder="전화번호를 입력하세요"
            />
          </Col>
        </Row>
        <Row gutter={8} className={styles.fromItem}>
          <Col span={16}>
            <Form.Input
              noLabel
              field="captchaCode"
              rules={[{ required: true, message: '캡차 코드를 입력하세요' }]}
              placeholder="캡차 코드를 입력하세요"
            />

          </Col>
          <Col span={8}>
            <img
              onClick={getImageKey}
              style={{ width: '100%', height: 32, display: 'flex', alignItems: 'center' }}
              src={captcha.code}
              alt=""
            />
          </Col>
        </Row>
        <Row gutter={8} className={styles.fromItem}>
          <Col span={16}>
            <Form.Input
              noLabel
              field="phoneCode"
              rules={[{ required: true, message: '휴대폰 인증 코드를 입력하세요' }]}
              placeholder="휴대폰 인증 코드"
            />
          </Col>
          <Col span={8}>
            <Button style={{ height: 35 }} block={true} onClick={sendSMS} disabled={time !== 60}>
              {time === 60 ? '인증 코드 전송' : `${time}초 후 다시 시도`}
            </Button>
          </Col>
        </Row>
        <Row gutter={8} className={styles.fromBtnItem}>
          <Col span={24}>
            <Button type="primary" htmlType="submit" block={true}>
              즉시 로그인
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default LoginMobile;
