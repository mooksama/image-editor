import styles from './styles.module.less';
import React, { useEffect, useState } from 'react';
import { Input } from '@douyinfe/semi-ui';

export interface IProps {}

export default function SvgIcofont(props: IProps) {
  const [keywords, setKeywords] = useState('');

  return (
    <div className={styles.iconfont}>
      <div className={styles.search}>
        <Input placeholder="검색할 ICO 이름을 입력하세요" className={styles.input} value={keywords} onChange={setKeywords} />
        <a
          className={styles.btn}
          href={`https://www.iconfont.cn/search/index?q=${encodeURIComponent(
            keywords,
          )}&page=1&searchType=icon&fromCollection=-1`}
          target="_blank"
        >
          검색
        </a>
      </div>
      <div className={styles.tips}>
        <h3>사용 방법</h3>
        <p>1. iconfont에 접속하여 아이콘 검색</p>
        <p>2. 아이콘 선택 후 다운로드 버튼 클릭</p>
        <p>3、点击“复制SVG代码”</p>
        <p>4. 캔버스에서 Ctrl+V 키로 붙여넣기</p>
      </div>
    </div>
  );
}
