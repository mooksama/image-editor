import React from 'react';
import { Spin, Empty } from '@douyinfe/semi-ui';
/**
 * data === null 은 loading 상태를 나타냄
 * @param {props}
 * @returns
 */
interface ListStatusProps {
  data: any;
  loading?: JSX.Element;
  empty?: JSX.Element;
  error?: JSX.Element;
  children: JSX.Element;
}

export default function ListStatus({ data, loading, empty, error, children }: ListStatusProps): JSX.Element {
  if (!loading) {
    loading = (
      <Spin size="large" tip="로딩 중...">
        {children}
      </Spin>
    );
  }
  if (!empty) {
    empty = <Empty description="데이터 없음" />;
  }
  if (!error) {
    error = <Empty description="로드 실패" />;
  }
  if (data === null) {
    return loading;
  }
  if (data && data.length === 0) {
    return empty;
  }
  if (data && data.length > 0) {
    return children;
  }
  return error;
}
