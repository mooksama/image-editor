import { Toast, Notification } from '@douyinfe/semi-ui';
import { editor } from '@stores/editor';
import { util } from '@utils/index';
import { pubsub } from '@utils/pubsub';
import { observer } from 'mobx-react';
import React, { useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import type { HotkeysEvent } from 'react-hotkeys-hook/src/types';
import { server } from '@pages/editor/components/sources/my/server';
import { addImageItem } from './components/sources/addItem';
import { user } from '@stores/user';

export interface IProps {}

function HotKeys(props: IProps) {
  const mouseXY = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = e => {
      // console.log(e.pageX, e.pageY);
      mouseXY.current.x = e.pageX;
      mouseXY.current.y = e.pageY;
    };
    document.addEventListener('mousemove', onMove);

    const pasteFuntion = async event => {
      event.stopPropagation();
      if (editor.copyTempData) {
        console.log('붙여넣기 요소');
        // if (!editor.copyTempData) {
        //   Toast.error('먼저 Ctrl + C를 사용하여 복사하십시오');
        //   return;
        // }
        const elems = editor.cloneElements(editor.copyTempData);
        editor.pageData.layers.unshift(...elems);
        editor.updateCanvas();
        editor.setSelectedElementIds(elems.map(d => d.id));
        editor.store.emitControl(elems.map(d => d.id));
      } else {
        // 로그인하지 않은 경우 먼저 로그인해야 합니다
        if (!user.info) {
          // pubsub.publish('showLoginModal');
          Toast.error('먼저 로그인하십시오');
          return;
        }

        const clipdata = event.clipboardData || (window as any).clipboardData;
        // console.log('clipdata', clipdata, item.getAsFile());
        const item = clipdata.items[0];
        const svgString = clipdata.getData('text/plain');
        let svgFile = null;
        if (svgString && util.isSVGString(svgString)) {
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
          svgFile = new File([svgBlob], 'image.svg', { type: 'image/svg+xml' });
        }

        // 只取剪切板中最新的
        if ((item && item.kind == 'file' && item.type.match(/^image\//i)) || svgFile) {
          const tid = Toast.info('파일 업로드 중...');
          // 파일 업로드
          const [res, err] = await server.formUpdate({
            files: svgFile ? [svgFile] : [item.getAsFile()],
            filename: `${util.createID()}.${svgFile ? 'svg' : 'png'}`,
            file_type: 'image', // file-普通文件 image-图片文件 audio-音频文件 video-视频文件
            app_id: editor.appid,
          });
          Toast.close(tid);

          // // 保存到素材库
          // const [item, err] = await server.createUserMaterial({
          //   app_id: editor.appid,
          //   name: name,
          //   urls: { url, thumb },
          //   attrs,
          // });

          const _img = await util.imgLazy(res.url);
          const imgLayer = await addImageItem({
            urls: { url: res.storage_path },
            attrs: {
              naturalWidth: _img.naturalWidth,
              naturalHeight: _img.naturalHeight,
            },
          });
          editor.setSelectedElementIds([imgLayer.id]);
          editor.store.emitControl([imgLayer.id]);

          Notification.open({
            title: '파일 업로드 성공!',
            content: 'SVG, JPEG, PNG, GIF 이미지 형식을 지원합니다',
            duration: 3,
            position: 'bottomRight',
          });
          return;
        }
      }
    };

    window.addEventListener('paste', pasteFuntion);

    return () => {
      window.removeEventListener('paste', pasteFuntion);
      document.removeEventListener('mousemove', onMove);
    };
  }, []);

  useHotkeys(
    [
      'ctrl+c', // 복사
      'ctrl+v', // 붙여넣기
      'ctrl+s', // 프로젝트 저장
      'ctrl+x', // 선택한 요소 잘라내기
      'ctrl+-', // 캔버스 축소
      'ctrl+=', // 캔버스 확대
      'ctrl+0', // 화면 크기에 맞게 캔버스 조정
      'ctrl+a', // 모두 선택
      'ctrl+d', // 선택 취소
      'ctrl+z', // 실행 취소
      'ctrl+shift+z', // 다시 실행
      'ctrl+]', // 선택한 레이어를 한 단계 위로 이동
      'ctrl+shift+}', // 선택한 레이어를 맨 위로 이동
      'ctrl+[', // 선택한 레이어를 한 단계 아래로 이동
      'ctrl+shift+{', // 선택한 레이어를 맨 아래로 이동
      'shift+up', // 위로 10px 이동
      'shift+down', // 아래로 10px 이동
      'shift+left', // 왼쪽으로 10px 이동
      'shift+right', // 오른쪽으로 10px 이동
      'up', // 위로 1px 이동
      'down', // 아래로 1px 이동
      'left', // 왼쪽으로 1px 이동
      'right', // 오른쪽으로 1px 이동
      'delete', // 선택한 요소 삭제
      'backspace', // 선택한 요소 삭제
    ],
    (event: KeyboardEvent, handler: HotkeysEvent) => {
      console.log('단축키 처리--->', event, handler, handler.keys);

      if (handler.ctrl && handler.keys.join('') !== 'v') {
        event.preventDefault();
      }

      if (handler.ctrl && handler.shift) {
        // ctrl + shift + *
        switch (handler.keys.join('')) {
          case 'z':
            console.log('다시 실행');
            pubsub.publish('keyboardRedo');
            break;
          case '}':
            console.log('선택한 레이어를 맨 위로 이동');
            editor.moveTopElement();
            break;
          case '{':
            console.log('선택한 레이어를 맨 아래로 이동');
            editor.moveBottomElement();
            break;
        }
      } else if (handler.ctrl) {
        // ctrl + *
        switch (handler.keys.join('')) {
          case ']':
            console.log('한 단계 위로 이동');
            editor.upOneElement();
            break;
          case '[':
            console.log('한 단계 아래로 이동');
            editor.downOneElement();
            break;
          case 'z':
            console.log('실행 취소');
            pubsub.publish('keyboardUndo');
            break;
          case 'a':
            console.log('모두 선택');
            editor.setContorlAndSelectedElemenent(editor.pageData.layers.map(layer => layer.id));
            break;
          case 'd':
            console.log('선택 취소');
            editor.setContorlAndSelectedElemenent([]);
            break;
          case '0':
            console.log('화면 크기에 맞게 캔버스 조정');
            pubsub.publish('keyboardSetViewSize', 'fit');
            break;
          case '-':
            console.log('캔버스 축소');
            pubsub.publish('keyboardSetViewSize', 'zoomIn');
            break;
          case '=':
            console.log('캔버스 확대');
            pubsub.publish('keyboardSetViewSize', 'zoomOut');
            break;
          case 'c':
            console.log('요소 복사');
            editor.copyElement();
            break;
          case 'x':
            console.log('요소 잘라내기');
            editor.cutElement();
            break;
          case 'v':
            // 上面
            break;
          case 's':
            console.log('프로젝트 수동 저장');
            pubsub.publish('keyboardSaveApp');
            break;
        }
      } else if (handler.shift) {
        // shfit + *
        switch (handler.keys.join('')) {
          case 'up':
            {
              console.log('위로 10px 이동');
              const elems = editor.getElementDataByIds([...editor.selectedElementIds]);
              elems.forEach(el => {
                el.y -= 10;
              });
              editor.updateCanvas();
            }
            break;
          case 'down':
            {
              console.log('아래로 10px 이동');
              const elems = editor.getElementDataByIds([...editor.selectedElementIds]);
              elems.forEach(el => {
                el.y += 10;
              });
              editor.updateCanvas();
            }
            break;
          case 'left':
            {
              console.log('왼쪽으로 10px 이동');
              const elems = editor.getElementDataByIds([...editor.selectedElementIds]);
              elems.forEach(el => {
                el.x -= 10;
              });
              editor.updateCanvas();
            }
            break;
          case 'right':
            {
              console.log('오른쪽으로 10px ���동');
              const elems = editor.getElementDataByIds([...editor.selectedElementIds]);
              elems.forEach(el => {
                el.x += 10;
              });
              editor.updateCanvas();
            }
            break;
        }
      } else {
        // 普通
        switch (handler.keys.join('')) {
          case 'up':
            {
              console.log('위로 1px 이동');
              const elems = editor.getElementDataByIds([...editor.selectedElementIds]);
              elems.forEach(el => {
                el.y -= 1;
              });
              editor.updateCanvas();
            }
            break;
          case 'down':
            {
              console.log('아래로 1px 이동');
              const elems = editor.getElementDataByIds([...editor.selectedElementIds]);
              elems.forEach(el => {
                el.y += 1;
              });
              editor.updateCanvas();
            }
            break;
          case 'left':
            {
              console.log('왼쪽으로 1px 이동');
              const elems = editor.getElementDataByIds([...editor.selectedElementIds]);
              elems.forEach(el => {
                el.x -= 1;
              });
              editor.updateCanvas();
            }
            break;
          case 'right':
            {
              console.log('오른쪽으로 1px 이동');
              const elems = editor.getElementDataByIds([...editor.selectedElementIds]);
              elems.forEach(el => {
                el.x += 1;
              });
              editor.updateCanvas();
            }
            break;
          case 'delete':
          case 'backspace':
            {
              console.log('삭제', [...editor.selectedElementIds]);
              editor.store.deleteLayers([...editor.selectedElementIds]);
              editor.updateCanvas();
              editor.store.emitControl([]);
              editor.record();
            }
            break;
        }
      }
    },
  );
  return null;
}

export default observer(HotKeys);
