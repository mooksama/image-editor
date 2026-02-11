import styles from './styles.module.less';
import Item from '../item';
import { Tooltip } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import { editor } from '@stores/editor';
import { useReducer } from 'react';
import { util } from '@utils/index';
import { pubsub } from '@utils/pubsub';
import {
  FlipHorizontally,
  FlipVertically,
  Lock,
  Unlock,
  DeleteOne,
  PreviewOpen,
  Ungroup,
  Copy,
  PreviewCloseOne,
  Cutting,
} from '@icon-park/react';
import CropperImage from './CropperImage';
import { GroupLayer, ImageLayer } from '@pages/editor/core/types/data';

export interface IProps {}

function FlipXY(props: IProps) {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as ImageLayer;

  editor.updateKey;
  if (!elementData) {
    return null;
  }
  return (
    <Item title="빠른 작업">
      {/* <div>테두리, 그림자, 자르기, 레이어, 아래로 이동, 위로 이동, 맨 앞으로, 맨 뒤로</div> */}
      <div className={styles.position}>
        {(elementData as any).type === 'image' && <CropperImage />}
        <Tooltip content="수평 뒤집기">
          <a
            onClick={() => {
              elementData.flipx = !elementData.flipx;
              editor.updateCanvas();
            }}
          >
            <FlipHorizontally size={20} color="var(--theme-icon)" />
          </a>
        </Tooltip>
        <Tooltip content="수직 뒤집기">
          <a
            onClick={() => {
              elementData.flipy = !elementData.flipy;
              editor.updateCanvas();
            }}
          >
            <FlipVertically size={20} color="var(--theme-icon)" />
          </a>
        </Tooltip>
        <Tooltip content="잠금/잠금 해제">
          <a
            onClick={() => {
              console.log('잠금');
              elementData._lock = !elementData._lock;
              editor.updateCanvas();
              forceUpdate();
            }}
          >
            {!elementData._lock ? (
              <Unlock size={20} color="var(--theme-icon)" />
            ) : (
              <Lock size={20} color="var(--theme-icon)" />
            )}
          </a>
        </Tooltip>
        <Tooltip content="보이기/숨기기">
          <a
            onClick={() => {
              console.log('보이기');
              elementData._hide = !elementData._hide;
              editor.updateCanvas();
              forceUpdate();
            }}
          >
            {elementData._hide ? (
              <PreviewCloseOne size={20} color="var(--theme-icon)" />
            ) : (
              <PreviewOpen size={20} color="var(--theme-icon)" />
            )}
          </a>
        </Tooltip>
        <Tooltip content="복사">
          <a
            onClick={() => {
              console.log('복사');
              editor.copyElementData();
              // editor.updateCanvas();
            }}
          >
            <Copy size={20} color="var(--theme-icon)" />
          </a>
        </Tooltip>
        <Tooltip content="삭제">
          <a
            onClick={() => {
              console.log('삭제');
              editor.store.deleteLayers([elementData.id]);
              editor.store.emitControl([]);
              editor.setSelectedElementIds([]);
              editor.updateCanvas();
            }}
          >
            <DeleteOne size={20} color="var(--theme-icon)" />
          </a>
        </Tooltip>
        {(elementData as any).type === 'group' && (
          <Tooltip content="그룹 해제">
            <a
              onClick={() => {
                console.log('상위 레이어로 그룹 해제');
                const ids = editor.store.unGroupData(elementData.id);
                editor.setSelectedElementIds([ids[0]]);
                editor.store.emitControl([ids[0]]);
                editor.updateCanvasKey = util.createID();
              }}
            >
              <Ungroup size={20} color="var(--theme-icon)" />
            </a>
          </Tooltip>
        )}
      </div>
    </Item>
  );
}

export default observer(FlipXY);
