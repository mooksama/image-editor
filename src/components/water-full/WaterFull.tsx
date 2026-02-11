// import { util } from '@utils/index';
// import { useEffect, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import styles from './waterfull.module.less';
import { IconSpin } from '@douyinfe/semi-icons';
import classNames from 'classnames';

export interface IProps {
  list?: any[];
  itemWidth?: number;
  style?: Record<string, any>;
  item?: any;
  columns?: number;
  itemClassName?: string;
  itemHeight?: boolean; // 고정 높이
}

// const defaultList = new Array(40).fill(1).map((d, i) => {
//   return {
//     width: util.randomNum(300, 500),
//     height: util.randomNum(100, 600),
//   };
// });

export default function WaterFall(props: IProps) {
  const { width = 0, ref } = useResizeDetector();
  const list = props.list;

  return (
    <div className={styles.list} style={{ ...(props.style || {}) }} ref={ref}>
      {!list && <IconSpin spin />}
      {list &&
        (() => {
          // 각 item의 너비, 간격은 기본적으로 10px이며, 역으로 너비를 계산합니다.
          let itemWidth = props.itemWidth || 120;
          const gap = 5;
          let columns = props.columns ? props.columns : ~~(width / (itemWidth + gap));
          if (!columns) {
            columns = 1;
          }
          itemWidth = ~~((width - (columns - 1) * gap) / columns);

          // 워터폴 알고리즘, 자동으로 높이와 좌표를 계산합니다.
          const columItems: any[][] = [];
          const totalHeight = new Array(columns).fill(0);
          if (columns === 1) {
            columItems.push(list);
          } else {
            list.forEach(elem => {
              const min = Math.min(...totalHeight);
              const index = totalHeight.findIndex(a => a === min);
            // 최대 높이는 너비의 2배를 초과할 수 없습니다.
              const itemHeight = Math.min(itemWidth * (elem.height / elem.width), itemWidth * 2);

              totalHeight[index] += itemHeight + gap;
              if (!columItems[index]) {
                columItems[index] = [];
              }
              columItems[index].push(elem);
            });
          }

          return columItems.map((items, i) => {
            return (
              <div
                key={i}
                className={styles.colums}
                style={{ marginLeft: i !== 0 ? gap : 0, width: (width - (columns - 1) * gap) / columns }}
              >
                {items.map(d => {
                  let hei = Math.min(~~(itemWidth * (d.height / d.width)), itemWidth * 2);
                  return (
                    <div
                      key={d.id}
                      className={classNames(styles.itemWrap, props.itemClassName)}
                      style={{ width: itemWidth, height: props.itemHeight ? 'auto' : hei, marginBottom: gap }}
                    >
                      {props.item ? props.item(d) : null}
                    </div>
                  );
                })}
              </div>
            );
          });
        })()}
    </div>
  );
}
