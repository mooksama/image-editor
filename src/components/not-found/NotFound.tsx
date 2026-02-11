import styles from './not-found.module.less';

import React, { Component } from 'react';

export default class NotFound extends Component {

  toHome = () => {
    location.href = '/';
  }

  render() {
    return (
      <div className={styles["not-found"]}>
        <div className={styles["not-found-title"]}>404----</div>
        <div className={styles["not-found-info"]}>페이지를 찾을 수 없습니다</div>
        <div className={styles["not-found-content"]}>
          <p>죄송합니다, 요청하신 페이지를 찾을 수 없습니다. URL이 잘못되었거나 페이지가 삭제되었을 수 있습니다.</p>
          <a type="primary" onClick={this.toHome}>
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }
}
