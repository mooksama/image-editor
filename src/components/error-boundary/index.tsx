import styles from './errorBoundary.module.less';
import { Button } from '@douyinfe/semi-ui';
import React, { Component } from 'react';

interface ErrorBoundaryProps {
  children?: JSX.Element;
}

interface ErrorBoundaryStates {
  errorMsgMap: any;
  hasError: boolean;
  errorMsg: string;
}

export interface IAppProps {}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryStates> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMsg: '',
      errorMsgMap: {
        timeout: '죄송합니다, 로딩 시간이 초과되었습니다!', // 오류 메시지에 대한 안내 텍스트
      },
    };
  }

  static getDerivedStateFromError(error: any) {
    // state를 업데이트하여 다음 렌더링에서 폴백 UI를 표시할 수 있도록 합니다
    return { hasError: true, errorMsg: error.message };
  }
 

  public render() {
    const { errorMsgMap, hasError, errorMsg } = this.state;

    if (hasError !== false) {
      // 사용자 정의 UI를 렌더링할 수 있습니다
      return (
        <div className={styles.errorBoundary}>
          <h1>{errorMsgMap[errorMsg] || '죄송합니다, 로드에 실패했습니다!'}</h1>
          <Button type="primary" key="console" onClick={() => window.location.reload()}>
            다시 로드
          </Button>
        </div>
      );
    } else {
      return this.props.children;
    }
  }
}
