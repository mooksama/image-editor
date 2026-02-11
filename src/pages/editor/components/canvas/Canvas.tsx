import styles from './canvas.module.less';

import { useEffect, useState, useReducer } from 'react';
import { editor } from '@stores/editor'; 
import { observer } from 'mobx-react'; 

import { View } from '../../core';

import { pubsub } from '@utils/pubsub';

import SetCanvasSize from './SetCanvasSize';
import ContextMenu from '../contextMenu';
import { config } from '@config/index';

// 외부 플러그인확장장
import exLayers from '@plugins/index';

export interface IProps {}

function Canvas(props: IProps) {
  const [target, setTarget] = useState<any>();
  useEffect(() => {
    setTarget(document.getElementById('h5dsCanvas'));
    pubsub.subscribe('emitSelectElements', (e, ids) => {
      editor.setContorlAndSelectedElemenent([...ids]);
    });

    return () => {
      pubsub.unsubscribe('emitSelectElements');
    };
  }, []);

  console.log('다시 페이지 가져오기');
  editor.updateViewKey;

  return (
    <div className={styles.canvas} id="h5dsCanvasOuter">
      <div className={styles.canvasInner} id="h5dsCanvas">
        {target && (
          <View
            resourceHost={config.resourcesHost}
            callback={store => {
              // 눈금자 테마 수정
              editor.ruler = store.ruler;
              if (editor.themeUpdateKey === 'dark') {
                editor.ruler.changeTheme('dark2');
              }

              editor.store = store;
              editor.movieCreateSuccess = true;
            }}
            exLayers={exLayers as any}
            env="editor"
            data={editor.pageData}
            target={target}
            onContextMenu={(e, layers) => {
              editor.showContextMenu(e.origin, {
                layers,
              });
            }}
            onDragUp={() => {
              editor.updateOption();
            }}
            onControlSelect={(e: any, ids) => {
              // console.log('select--------------------------------------------->', ids);
              // console.log('dddd', ids);
              editor.setSelectedElementIds(ids);
            }}
            addRecordCallback={() => {
              editor.recordUpdateTestKey = +new Date();
            }}
          />
        )}
      </div>
      <SetCanvasSize />
      <ContextMenu />
    </div>
  );
}

export default observer(Canvas);
