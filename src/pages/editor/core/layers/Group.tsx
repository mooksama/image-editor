import React, { useEffect, useMemo } from 'react';
import { Group } from 'leafer-ui';
import { LayerProps } from '../types/helper';
import { GroupLayer } from '../types/data';
import useLayerBaseStyle from '../hooks/useLayerBaseStyle';

import ImageLayer from './Image';
import TextLayer from './Text';
import exLayers from '@plugins/index';

export default function GroupComp(props: LayerProps) {
  const layer = props.layer as GroupLayer;
  const groupBox = useMemo(() => {
    const group = new Group({
      editable: props.isChild ? false : true,
      hitChildren: false,
      x: layer.x,
      y: layer.y,
      rotation: layer.rotation,
      opacity: layer.opacity,
      fill: 'rgba(0,0,0,0.0)',
    });
    group.id = layer.id;
    group.zIndex = props.zIndex;
    props.parent!.add(group as any);
    return group;
  }, []);

  // 공통 use
  useLayerBaseStyle(layer, groupBox as any, props.store, props.zIndex);

  // useEffect(() => {
  //   // 너비와 높이 설정
  //   groupBox.width = layer.width;
  //   groupBox.height = layer.height;
  // }, [layer.width, layer.height]);

  useEffect(() => {
    // 자식 컴포넌트의 업데이트 메서드 호출
    props.store.controlSelectFuns[layer.id] = () => {
      layer.childs.forEach(d => {
        if (props.store.controlSelectFuns[d.id]) {
          props.store.controlSelectFuns[d.id]();
        }
      });
    };

    // 자식 컴포넌트의 업데이트 메서드 호출
    props.store.controlScaleFuns[layer.id] = () => {
      layer.childs.forEach(d => {
        if (props.store.controlScaleFuns[d.id]) {
          props.store.controlScaleFuns[d.id]();
        }
      });
    };

    return () => {
      delete props.store.controlScaleFuns[layer.id];
      groupBox.remove();
      groupBox.destroy();
    };
  }, []);

  const { store, env } = props;

  console.log('更新组---》');

  return (
    <>
      {[...layer.childs].map((layer, i) => {
        switch (layer.type) {
          case 'image':
            return (
              <ImageLayer
                key={layer.id}
                hide={layer._hide}
                lock={layer._lock}
                dirty={layer._dirty}
                parent={groupBox}
                isChild={true}
                zIndex={99999 - i}
                layer={layer}
                store={store}
                env={env}
              />
            );
          case 'text':
            return (
              <TextLayer
                key={layer.id}
                hide={layer._hide}
                lock={layer._lock}
                dirty={layer._dirty}
                isChild={true}
                parent={groupBox}
                zIndex={99999 - i}
                layer={layer}
                store={store}
                env={env}
              />
            );
          case 'group':
            return (
              <GroupComp
                key={layer.id}
                hide={layer._hide}
                lock={layer._lock}
                dirty={layer._dirty}
                isChild={true}
                parent={groupBox}
                zIndex={99999 - i}
                layer={layer}
                store={store}
                env={env}
              />
            );
          default: {
            const exLayer = exLayers.find(d => d.config.pid === layer.type);
            if (exLayer) {
              const ELayer = exLayer.Layer as any;
              return (
                <ELayer
                  key={layer.id}
                  hide={layer._hide}
                  lock={layer._lock}
                  dirty={layer._dirty}
                  isChild={true}
                  parent={groupBox}
                  zIndex={99999 - i}
                  layer={layer}
                  store={store}
                  env={env}
                />
              );
            }
          }
        }
        return null;
      })}
    </>
  );
}
