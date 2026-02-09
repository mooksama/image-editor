import styles from './styles.module.less';
import Item from '../item';
import { Tooltip } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import { editor } from '@stores/editor';
import { useReducer } from 'react';
// import { util } from '@utils/index';
// import { pubsub } from '@utils/pubsub';
import { Lock, Unlock, Group, DeleteOne, PreviewOpen, Copy, PreviewCloseOne } from '@icon-park/react';

export interface IProps {}

function GroupFast(props: IProps) {
  const elements = editor.getElementDataByIds([...editor.selectedElementIds]) || [];
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  return (
    <Item title="빠른 작업">
      {/* <div>테두리, 그림자, 자르기, 레이어, 아래로 이동, 위로 이동, 맨 위로 이동, 맨 아래로 이동</div> */}
      <div className={styles.position}>
        <Tooltip content="레이어 병합">
          <a
            onClick={() => {
              console.log([...editor.selectedElementIds]);
              // 데이터 병합
              const g = editor.store.groupData([...editor.selectedElementIds]);
              editor.setSelectedElementIds([g.id]);
              editor.store.emitControl([g.id]);
            }}
          >
            <Group theme="filled" size="20" fill="var(--theme-icon)" />
          </a>
        </Tooltip>
        <Tooltip content="잠금/잠금 해제">
          <a
            onClick={() => {
              console.log('잠금');
              elements.forEach(elementData => {
                elementData._lock = !elementData._lock;
              });
              editor.updateCanvas();
              forceUpdate();
            }}
          >
            {elements
              .map(d => {
                return d._lock ? 1 : 0;
              })
              .reduce((a, b) => a + b, 0) === 0 ? (
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
              elements.forEach(elementData => {
                elementData._hide = !elementData._hide;
              });
              editor.updateCanvas();
              forceUpdate();
            }}
          >
            {elements
              .map(d => {
                return d._hide ? 1 : 0;
              })
              .reduce((a, b) => a + b, 0) === 0 ? (
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
              console.log(
                '삭제',
                elements.map(d => d.id),
              );
              editor.store.deleteLayers(elements.map(d => d.id));
              editor.store.emitControl([]);
              editor.setSelectedElementIds([]);
              editor.updateCanvas();
            }}
          >
            <DeleteOne size={20} color="var(--theme-icon)" />
          </a>
        </Tooltip>
      </div>
    </Item>
  );
}

export default observer(GroupFast);
