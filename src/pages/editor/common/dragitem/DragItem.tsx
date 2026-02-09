import { useEffect, useState } from 'react';
import { DragItemCls } from './dragItemCls';
import styles from './styles.module.less';
import type { SourceItem } from '../../types';
import { Time, Music, Text, ColorFilter } from '@icon-park/react';
import $ from 'jquery';
import { editor } from '@stores/editor';
import { addItem, addTextItem, addImageItem } from '@pages/editor/components/sources/addItem';
import { pubsub, util } from '@utils/index';
// import { ImageLayer, TextLayer } from '@pages/editor/core/types/data';
// import { Toast } from '@douyinfe/semi-ui';

export interface IProps {}

export default function DragItem(props: IProps) {
  const [item, setItem] = useState<SourceItem>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const di = new DragItemCls();
    let tempPos = null;
    di.on('dragstart', (d, pos, e) => {
      tempPos = { ...pos };
      // console.log('xxx', );
      setItem(d);
      setPosition({ ...pos });
    });

    di.on('dragmove', (d, pos, e) => {
      // if ($(e.target).closest('#h5dsVideoTracksBody')[0]) {
      //   console.log('타임라인에 들어갔습니다');
      // } else {
      //   console.log('떠났습니다');
      // }
      setPosition({ ...pos });
    });

    di.on('dragend', async (d, pos, e) => {
      // console.log(d, pos, e);
      setItem(null);
      // 오차 3px 이내는 클릭 이벤트로 간주
      if (Math.abs(pos.x - tempPos.x) < 3 && Math.abs(pos.y - tempPos.y) < 3) {
        await addItem(d);
        tempPos = null;
        return;
      }
      tempPos = null;

      const offset = $('#h5dsCanvasOuter').offset();
      const { x: appx, y: appy, scaleX, scaleY } = editor.store.app;
      console.log('editor.store.app', editor.store.app, appx, appy, scaleX, scaleY);
      // 요소가 드롭된 위치
      const dropPos = {
        x: (pos.x - offset.left - appx) / scaleX,
        y: (pos.y - offset.top - appy) / scaleY,
      };

      // 데이터 생성
      let layer = null;
      if (d.type === 'image') {
        layer = await addImageItem(d, dropPos);
      } else if (d.type === 'text') {
        layer = await addTextItem(d, dropPos);
      }
      // 요소 선택
      if (layer) {
        editor.setSelectedElementIds([layer.id]);
        editor.store.emitControl([layer.id]);
      }

      // pubsub.publish('timelineLoading', true);
      // pubsub.publish('timelineLoading', false);
    });

    return () => {
      di.destroy();
    };
  }, []);

  if (item) {
    switch (item.type) {
      case 'video':
      case 'image':
      case 'lottie':
      case 'sticker':
        return (
          <div
            style={{
              top: position.y,
              left: position.x,
            }}
            className={styles.item}
          >
            <img className={styles.thumb} src={editor.store.setURL(item.urls.thumb)} alt="" />
            <span className={styles.nameTime}>
              <h5 style={{ width: 100 }}>{item.name}</h5>
              {item.type === 'video' && (
                <p>
                  <Time theme="outline" size="14" fill="var(--theme-icon)" />
                  &nbsp;&nbsp;
                  {util.secToTime(item.attrs?.duration || 5, 'mm:ss')}
                </p>
              )}
            </span>
          </div>
        );
      case 'audio':
        return (
          <div
            style={{
              top: position.y,
              left: position.x,
            }}
            className={styles.item}
          >
            <Music theme="outline" size="35" fill="var(--theme-icon)" />
            <span className={styles.nameTime}>
              <h5>{item.name}</h5>
              <p>
                <Time theme="outline" size="14" fill="var(--theme-icon)" />
                &nbsp;&nbsp;
                {util.secToTime(item.attrs?.duration || 5, 'mm:ss')}
              </p>
            </span>
          </div>
        );
      case 'text':
      case 'filter':
      case 'effect':
      case 'transition':
        return (
          <div
            style={{
              top: position.y,
              left: position.x,
            }}
            className={styles.item}
          >
            {item.type === 'text' && <Text theme="outline" size="20" fill="var(--theme-icon)" />}
            {['filter', 'effect', 'transition'].includes(item.type) && (
              <img style={{ height: 30 }} className={styles.thumb} src={editor.store.setURL(item.urls.thumb)} alt="" />
            )}
            <span className={styles.nameTime}>
              <h5>{item.name}</h5>
            </span>
          </div>
        );
      default:
        return null;
    }
  } else {
    return null;
  }
}
