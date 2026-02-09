import styles from './styles.module.less';
import React, { useEffect, useState } from 'react';
import { Input } from '@douyinfe/semi-ui';

export interface IProps {}

export default function SvgIcofont(props: IProps) {
  const [keywords, setKeywords] = useState('');

  return (
    <div className={styles.iconfont}>
      <div className={styles.search}>
        <Input placeholder="ICO 이름을 입력하세요" className={styles.input} value={keywords} onChange={setKeywords} />
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
        <p>1. iconfont에 들어가서 아이콘을 검색합니다</p>
        <p>2. 아이콘을 선택하고 다운로드 버튼을 클릭합니다</p>
        <p>3. "SVG 코드 복사"를 클릭합니다</p>
        <p>4. 캔버스로 돌아가 Ctrl+V를 눌러 붙여넣기 합니다</p>
      </div>
    </div>
  );
}
