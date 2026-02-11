import styles from './keyboardModal.module.less';
import { Modal, Toast } from '@douyinfe/semi-ui';
import { KeyboardOne } from '@icon-park/react';
import { useState, useEffect } from 'react';
import { util } from '@utils/index';
import {
  Clipboard,
  HorizontalSpacingBetweenItems,
  Copy,
  Intersection,
  Delete,
  Return,
  ArrowCircleRight,
  ArrowCircleLeft,
  LinkFour,
  ZoomIn,
  ZoomOut,
  LinkCloudSucess,
} from '@icon-park/react';

export interface IProps {}

/**
  'ctrl+c', // 복사 -
  'ctrl+v', // 붙여넣기 -
  'ctrl+s', // 프로젝트 저장 -
  'ctrl+x', // 선택한 요소 잘라내기 -
  'ctrl+-', // 캔버스 축소 -
  'ctrl+=', // 캔버스 확대 -
  'ctrl+0', // 캔버스를 화면 크기에 맞게 조정 -
  'ctrl+a', // 모두 선택 -
  'ctrl+d', // 선택 취소 -
  'ctrl+z', // 실행 취소 -
  'ctrl+shift+z', // 다시 실행 -
  'ctrl+]', // 선택한 레이어를 한 단계 위로 이동 -
  'ctrl+shift+]', // 선택한 레이어를 맨 위로 이동 -
  'ctrl+[', // 선택한 레이어를 한 단계 아래로 이동 -
  'ctrl+shift+[', // 선택한 레이어를 맨 아래로 이동 -
  'shift+up', // 10px 위로 이동 -
  'shift+down', // 10px 아래로 이동 -
  'shift+left', // 10px 왼쪽으로 이동 -
  'shift+right', // 10px 오른쪽으로 이동 -
  'up', // 1px 위로 이동 -
  'down', // 1px 아래로 이동 -
  'left', // 1px 왼쪽으로 이동 -
  'right', // 1px 오른쪽으로 이동 -
  'delete', // 선택한 요소 삭제 -
 */
export default function KeyboardModal(props: IProps) {
  const [visible, setVisible] = useState(false);

  const items = [
    {
      name: '복사',
      win: 'Ctrl + C',
      mac: '⌘ + C',
      icon: <Copy theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '잘라내기',
      win: 'Ctrl + X',
      mac: '⌘ + X',
      icon: <Clipboard theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '붙여넣기',
      win: 'Ctrl + V',
      mac: '⌘ + V',
      icon: <Intersection theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '모두 선택',
      win: 'Ctrl + A',
      mac: '⌘ + A',
      icon: <Intersection theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '선택 취소',
      win: 'Ctrl + D',
      mac: '⌘ + D',
      icon: <Intersection theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '한 단계 위로 이동',
      win: 'Ctrl + ]',
      mac: '⌘ + ]',
      icon: <Intersection theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '한 단계 아래로 이동',
      win: 'Ctrl + [',
      mac: '⌘ + [',
      icon: <Intersection theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '맨 위로 이동',
      win: 'Ctrl + Shift + ]',
      mac: '⌘ + Shift + ]',
      icon: <Intersection theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '맨 아래로 이동',
      win: 'Ctrl + Shift + [',
      mac: '⌘ + Shift + [',
      icon: <Intersection theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '삭제',
      win: 'Delete/Backspace',
      mac: 'Delete/Backspace',
      icon: <Delete theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '실행 취소',
      win: 'Ctrl + Z',
      mac: '⌘ + Z',
      icon: <Return theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '다시 실행',
      win: 'Ctrl + Shift + Z',
      mac: '⌘ + Shift + Z',
      icon: <Return style={{ transform: `scaleX(-1)` }} theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '1px 오른쪽으로 이동',
      win: '→',
      mac: '→',
      icon: <ArrowCircleRight theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '1px 왼쪽으로 이동',
      win: '←',
      mac: '←',
      icon: <ArrowCircleLeft theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '1px 위로 이동',
      win: '↑',
      mac: '↑',
      icon: <ArrowCircleLeft theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '1px 아래로 이동',
      win: '↓',
      mac: '↓',
      icon: <ArrowCircleLeft theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '10px 왼쪽으로 이동',
      win: 'Shift + ←',
      mac: 'Shift + ←',
      icon: <ArrowCircleLeft theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '10px 위로 이동',
      win: 'Shift + ↑',
      mac: 'Shift + ↑',
      icon: <ArrowCircleLeft theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '10px 아래로 이동',
      win: 'Shift + ↓',
      mac: 'Shift + ↓',
      icon: <ArrowCircleLeft theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '캔버스 확대',
      win: 'Ctrl + +',
      mac: '⌘ + +',
      icon: <ZoomIn theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '캔버스 축소',
      win: 'Ctrl + -',
      mac: '⌘ + -',
      icon: <ZoomOut theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '캔버스를 화면 크기에 맞게 조정',
      win: 'Ctrl + 0',
      mac: '⌘ + 0',
      icon: <ZoomOut theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: '저장',
      win: 'Ctrl + S',
      mac: '⌘ + S',
      icon: <LinkCloudSucess theme="outline" size="20" fill="var(--theme-icon)" />,
    },
  ];

  const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
  const [left, right] = util.splitArray(items, Math.ceil(items.length / 2));
  const type = isMac ? 'mac' : 'win';

  console.log({ items, left, right });

  return (
    <>
      <Modal
        width={1000}
        title="단축키"
        visible={visible}
        onCancel={() => setVisible(false)}
        closeOnEsc={true}
        footer={null}
      >
        <div className={styles.boxs}>
          <div className={styles.box}>
            {left.map(d => {
              return (
                <section key={d.name}>
                  <span className={styles.name}>
                    {d.icon}
                    {d.name}
                  </span>
                  <span className={styles.tip}>{d[type]}</span>
                </section>
              );
            })}
          </div>
          <div className={styles.line}></div>
          <div className={styles.box}>
            {right.map(d => {
              return (
                <section key={d.name}>
                  <span className={styles.name}>
                    {d.icon}
                    {d.name}
                  </span>
                  <span className={styles.tip}>{d[type]}</span>
                </section>
              );
            })}
          </div>
        </div>
      </Modal>
      <a onClick={() => setVisible(true)} style={{ opacity: 0.5 }}>
        <KeyboardOne theme="outline" size="24" fill="var(--theme-icon)" />
      </a>
    </>
  );
}
