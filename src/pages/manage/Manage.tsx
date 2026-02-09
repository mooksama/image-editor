import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button } from '@douyinfe/semi-ui';
import { pubsub } from '@utils/index';
import { userService } from '@server/index';
import { user } from '@stores/user';

function Manage() {
  const startPageLoading = () => {
    pubsub.publish('pageLoading', {
      start: true,
    });
  };

  const endPageLoading = () => {
    pubsub.publish('pageLoading', {
      end: true,
    });
  };

  return (
    <div>
      로그인 후 페이지
      <img style={{ width: 100 }} src={user.info?.avatarUrl} alt="" />
      <Button onClick={startPageLoading}>페이지 로딩 시작</Button>
      <Button onClick={endPageLoading}>페이지 로딩 종료</Button>
      <Button onClick={() => userService.logout()}>로그아웃</Button>
    </div>
  );
}

export default Manage;
