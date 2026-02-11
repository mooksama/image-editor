import React, { useEffect, useState, useRef, useMemo, useReducer } from 'react';
import { BaseLayer, BasePage, ENV, ExLayer } from './types/data';
import { App, Box, Leafer, Rect, DragEvent, PointerEvent } from 'leafer-ui';
import FrameComp from './Frame';
import debounce from 'lodash/debounce';
import { addListener, removeListener } from 'resize-detector';
import Store from './stores/Store';
import RecordManager from './Record';
import ImageLayer from './layers/Image';
import TextLayer from './layers/Text';
import GroupLayer from './layers/Group';
import { Ruler } from 'leafer-x-ruler';
import { EditorEvent, EditorMoveEvent, EditorScaleEvent, EditorRotateEvent } from '@leafer-in/editor';
// import { ILeafer } from '@leafer-ui/interface';
import { ScrollBar } from '@leafer-in/scroll';
import { utils } from './tools';
import EditorLine from './leafer-extends/EditorLine';
import rotateIco from './rotate.png';

// console.log('exLayers', exLayers);

export interface IViewProps {
  data: BasePage;
  target: HTMLElement; // canvas가 들어갈 DOM 컨테이너
  env: ENV;
  resourceHost: string; // 리소스 파일 접두사
  exLayers?: ExLayer[]; // 확장 컴포넌트
  // 렌더링 후 실행
  callback?: (store: Store) => void;
  // 편집기 이벤트
  onControlSelect?: (e: EditorEvent, ids: string[]) => void;
  onControlScale?: (e: EditorEvent) => void;
  onControlMove?: (e: EditorEvent) => void;
  onControlRotate?: (e: EditorEvent) => void;
  onDragUp?: (e: EditorEvent) => void;
  onContextMenu?: (e: EditorEvent, layers: BaseLayer[]) => void;
  addRecordCallback?: () => void; // 기록 추가 콜백
}

export default function View(props: IViewProps) {
  const { target, data, env, resourceHost, exLayers = [] } = props;
  const [loaded, setLoaded] = useState<boolean>(false);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const store = useMemo<Store>(() => {
    const s = new Store();
    s.resourceHost = resourceHost;
    s.data = data;
    s.env = env;
    s.updateView = forceUpdate;
    s.addRecordCallback = props.addRecordCallback;
    return s;
  }, []);

  // const [pos, setPos] = useState({
  //   x: (target.clientWidth - data.width * scale) / 2,
  //   y: (target.clientHeight - data.height * scale) / 2,
  // });

  useEffect(() => {
    const app = new App({
      view: target,
      editor: {
        lockRatio: 'corner',
        stroke: '#3f99f7',
        skewable: false,
        hover: false,
        middlePoint: { cornerRadius: 100, width: 20, height: 6 },
        rotatePoint: {
          width: 20,
          height: 20,
          fill: {
            type: 'image',
            url: rotateIco,
          },
        },
      },
      tree: {
        usePartRender: true,
      },
      sky: {
        type: 'draw',
        usePartRender: true,
      },
    });
    // console.log('app', app);
    //@ts-ignore
    store.app = app.tree;
    store.editor = app.editor;
    setLoaded(true);

    if (props.env === 'editor') {
      app.editor.on(EditorRotateEvent.ROTATE, (e: EditorEvent) => {
        // console.log('rotate', e);
        const list = (e as any).current.leafList.list;
        const layers = store.getLayerByIds(list.map(d => d.id));
        // 데이터 동기화
        list.forEach(box => {
          const layer = layers.find(d => d.id === box.id) as BaseLayer;
          if (layer) {
            layer.rotation = box.rotation;
            layer.x = utils.toNum(box.x);
            layer.y = utils.toNum(box.y);
          }
        });
        // forceUpdate();
        if (props.onControlRotate) {
          props.onControlRotate(e);
        }
      });

      app.editor.on(EditorScaleEvent.SCALE, (e: EditorEvent) => {
        // console.log('scale', e);
        const list = (e as any).current.leafList.list;
        const layers = store.getLayerByIds(list.map(d => d.id));

        // 그룹인 경우, children의 매개변수도 계산해야 합니다.
        const setGroupChildrenSize = box => {
          const ids = box.children.map(d => d.id);
          const innerLayers = store.getLayerByIds(ids);
          box.children.forEach(b => {
            const inlayer = innerLayers.find(d => d.id === b.id) as any;
            inlayer.width = b.width;
            inlayer.height = b.height;
            // 텍스트인 경우, x, y도 수정해야 합니다.
            if (inlayer.type === 'text') {
              inlayer.x = b.x;
              inlayer.y = b.y;
            }
            if (inlayer.type === 'group') {
              setGroupChildrenSize(b);
            }
          });
        };

        // 데이터 동기화
        list.forEach(box => {
          const layer = layers.find(d => d.id === box.id) as any;
          if (layer.type === 'text') {
            layer.x = box.x;
            layer.y = box.y;
          } else {
            layer.width = box.width;
            layer.height = box.height;
          }
          const func = store.controlScaleFuns[layer.id];
          if (func) {
            func();
          }
          // 그룹의 자식 요소의 크기 설정
          if (layer.type === 'group') {
            setGroupChildrenSize(box);
          }
        });
        // forceUpdate();
        if (props.onControlScale) {
          props.onControlScale(e);
        }
      });

      app.editor.on(EditorMoveEvent.MOVE, (e: EditorEvent) => {
        // console.log('move', e);
        const list = (e as any).current.leafList.list;
        const layers = store.getLayerByIds(list.map(d => d.id));
        // 데이터 동기화
        list.forEach(box => {
          const layer = layers.find(d => d.id === box.id);
          if (layer) {
            layer.x = box.x;
            layer.y = box.y;
          }
        });
        if (props.onControlMove) {
          props.onControlMove(e);
        }
      });

      app.editor.on(PointerEvent.MENU, e => {
        const list = (e as any).current.leafList.list;
        const layers = store.getLayerByIds(list.map(d => d.id));
        if (props.onContextMenu) {
          props.onContextMenu(e, layers);
        }
      });

      // 편집기 이벤트
      app.editor.on(EditorMoveEvent.SELECT, (e: EditorEvent) => {
        const ids: string[] = [];
        if (e.value) {
          if (e.value instanceof Array) {
            e.value.forEach(v => {
              ids.push(v.id);
            });
          } else {
            ids.push(e.value.id);
          }
        }
        const layers = store.getLayerByIds(ids);
        if (layers.length > 1) {
          app.editor.config.lockRatio = true;
        } else {
          if (layers[0]?.type === 'text' || layers[0]?.type === 'group') {
            app.editor.config.lockRatio = true;
          } else {
            app.editor.config.lockRatio = 'corner';
          }
        }

        ids.forEach(id => {
          const func = store.controlSelectFuns[id];
          if (func) {
            func();
          }
        });

        if (props.onControlSelect) {
          props.onControlSelect(e, ids);
        }
      });

      // 마우스 버튼을 놓음
      app.editor.on(DragEvent.UP, e => {
        const elementIds = utils.getIdsFromUI(store.editor.target);
        console.log('마우스 버튼을 놓음', elementIds);
        if (elementIds.length) {
          elementIds.forEach(id => {
            const fun = store.elementDragUp[id];
            if (fun) fun();
          });
        }
        store.record?.add({
          type: 'update',
          desc: '컨트롤러 마우스 버튼을 놓음',
          selecteds: [...elementIds],
        });
        if (props.onDragUp) {
          props.onDragUp(e);
        }
      });

      new ScrollBar(app as any);
      // new EditorLine(app);

      // 눈금자
      const ruler = new Ruler(app as any);
      // 사용자 정의 테마 추가
      ruler.addTheme('dark2', {
        backgroundColor: '#16161a',
        textColor: 'rgba(255, 255, 255, 0.5)',
        borderColor: '#686868',
        highlightColor: 'rgba(0, 102, 255, 0.5)',
      });
      store.ruler = ruler;
    }

    // 컨테이너 변경 사항 모니터링
    const onResize = debounce(() => {
      store.autoViewSize();
    }, 100);
    addListener(target, onResize);

    setTimeout(() => {
      store.autoViewSize();
    }, 100);

    if (props.callback) {
      props.callback(store);
    }
    return () => {
      removeListener(target, onResize);
      // app.destroy();
    };
  }, [target, store]);

  useEffect(() => {
    if (store) {
      store.data = data;
    }
  }, [data]);
  if (!loaded) {
    return;
  }

  return (
    <>
      <FrameComp data={{ ...data }} parent={store.app as any}>
        {data.layers.map((layer, i) => {
          switch (layer.type) {
            case 'image':
              return (
                <ImageLayer
                  key={layer.id}
                  hide={layer._hide}
                  lock={layer._lock}
                  dirty={layer._dirty}
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
                  zIndex={99999 - i}
                  layer={layer}
                  store={store}
                  env={env}
                />
              );
            case 'group':
              return (
                <GroupLayer
                  key={layer.id}
                  hide={layer._hide}
                  lock={layer._lock}
                  dirty={layer._dirty}
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
      </FrameComp>
      {env === 'editor' && <RecordManager store={store} />}
    </>
  );
}
