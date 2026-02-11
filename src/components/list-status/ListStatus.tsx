import React from 'react';
import { Spin, Empty } from '@douyinfe/semi-ui';
/**
 * data === null은 로딩 상태를 나타냅니다
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

  if (data === null) {
    return loading;
  }

  if (data.length === 0) {
    return empty || <Empty description="데이터가 없습니다" />;
  }

  if (error) {
    return error;
  }

  return children;
}
