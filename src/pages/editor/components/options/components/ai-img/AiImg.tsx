import styles from './style.module.less';
import Item from '../item';
import { Modal, Toast } from '@douyinfe/semi-ui';
// import {
//   AlignLeft,
//   AlignHorizontally,
//   AlignRight,
//   AlignTop,
//   AlignVertically,
//   AlignBottom,
//   // DistributeHorizontalSpacing,
//   // DistributeVerticalSpacing,
// } from '@icon-park/react';
import { observer } from 'mobx-react';
import { editor } from '@stores/editor';
import { pubsub } from '@utils/pubsub';
import * as aiIco from './icon';

export interface IProps {}

function Align(props: IProps) {
  const elementData = editor.getElementData() as any;
  // const { width, height } = editor.data;
  return (
    <Item title="AI 기능">
      <div className={styles.btns}>
        <a
          onClick={() => {
            Toast.warning('작성자가 아직 구현하지 않았습니다. 기여해 주세요.');
          }}
        >
          <aiIco.AiBg color="#fff" />
          배경 제거
        </a>
        <a
          onClick={() => {
            Toast.warning('공식 웹사이트에서 체험해 주세요.');
          }}
        >
          <aiIco.AiKouTu color="#fff" />
          이미지 자르기
        </a>
      </div>
      <div className={styles.btns}>
        <a
          onClick={() => {
            Toast.warning('작성자가 아직 구현하지 않았습니다. 기여해 주세요.');
          }}
        >
          <aiIco.AiQingXi color="#fff" />
          선명하게
        </a>
        <a
          onClick={() => {
            Toast.warning('작성자가 아직 구현하지 않았습니다. 기여해 주세요.');
          }}
        >
          <aiIco.AiTuMo color="#fff" />
          덧칠하기
        </a>
      </div>
    </Item>
  );
}

export default observer(Align);
