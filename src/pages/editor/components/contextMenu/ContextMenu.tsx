import { editor } from '@stores/editor';
import { theme } from '@theme';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { Menu, Item, Separator, Submenu, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import styles from './styles.module.less';
import { util } from '@utils/index';
import { Toast } from '@douyinfe/semi-ui';
import { GroupLayer } from '@pages/editor/core/types/data';

export interface IProps {}
 
function ContextMenu(props: IProps) {
  const MENU_ID = 'context_menus';
  const { show } = useContextMenu({
    id: MENU_ID,
  });

  useEffect(() => {
    editor.showContextMenu = (event: any, props: Record<string, any>) => {
      console.log('ee', event, props);
      show({
        event,
        props,
      });
    };
  }, []);

  const handleItemClick = ({ id, event, props }: any) => {
    const ids = props.layers.map(d => d.id) || [];
    switch (id) {
      case 'cut':
        editor.cutElement(ids);
        break;
      case 'copy':
        editor.copyElement(ids);
        break;
      case 'lock':
        {
          props.layers.forEach(elementData => {
            elementData._lock = !elementData._lock;
          });
          editor.updateCanvas();
        }
        break;
      case 'hide':
        {
          props.layers.forEach(elementData => {
            elementData._hide = !elementData._hide;
          });
          editor.updateCanvas();
        }
        break;
      case 'up1':
        editor.upOneElement(ids);
        break;
      case 'down1':
        editor.downOneElement(ids);
        break;
      case 'moveTop':
        editor.moveTopElement(ids);
        break;
      case 'ungroup':
        {
          const elementData = editor.getElementData();
          const ids = editor.store.unGroupData(elementData.id);
          editor.setSelectedElementIds([ids[0]]);
          editor.store.emitControl([ids[0]]);
          editor.updateCanvasKey = util.createID();
        }
        break;
      case 'group':
        {
          // 数据合并
          const g = editor.store.groupData([...editor.selectedElementIds]);
          editor.setSelectedElementIds([g.id]);
          editor.store.emitControl([g.id]);
        }
        break;
      case 'moveBottom':
        editor.moveBottomElement(ids);
        break;
      case 'clearCopyTempData':
        {
          editor.copyTempData = null;
          (window as any).clipboardData = null;
          Toast.info('클립보드 정리 완료');
        }
        break;
      //etc...
    }
  };

  let group = null;
  let ungroup = null;
  if (editor.selectedElementIds.length > 1) {
    group = {
      id: 'group',
      name: '조합',
      extra: 'Ctrl + G',
    };
  } else {
    const layer = editor.getElementData() as GroupLayer;
    if (layer && layer.type === 'group') {
      ungroup = {
        id: 'ungroup',
        name: '조합 해제',
        extra: 'Ctrl + Shift + G',
      };
    }
  }

  const menus = [
    {
      id: 'up1',
      name: '한 단계 위로',
      extra: 'Ctrl + ]',
    },
    {
      id: 'down1',
      name: '한 단계 아래로',
      extra: 'Ctrl + [',
    },
    {
      id: 'moveTop',
      name: '맨 위로 이동',
      extra: 'Ctrl + Shift + ]',
    },
    {
      id: 'moveBottom',
      name: '맨 아래로 이동',
      extra: 'Ctrl + Shift + [',
    },
    {
      id: 'sp1',
      name: '구분선',
    },
    group,
    ungroup,
    {
      id: 'cut',
      name: '잘라내기',
      extra: 'Ctrl + X',
    },
    {
      id: 'copy',
      name: '복사',
      extra: 'Ctrl + C',
    }, 
    {
      id: 'lock',
      name: '잠금/잠금 해제',
      extra: '',
    },
    {
      id: 'hide',
      name: '보이기/숨기기',
      extra: '',
    },
    {
      id: 'clearCopyTempData',
      name: '클립보드 정리',
    },
  ].filter(d => d);

  editor.themeUpdateKey;
  return (
    <>
      <Menu id={MENU_ID} theme={theme.getTheme()}>
        {menus.map(d => {
          if (d.name === '구분선') {
            return <Separator key={d.id} />;
          }
          return (
            <Item id={d.id} key={d.id} onClick={handleItemClick}>
              <div className={styles.item}>
                <span>{d.name}</span>
                <i>{d.extra}</i>
              </div>
            </Item>
          );
        })}
 
      </Menu>
    </>
  );
}

export default observer(ContextMenu);
