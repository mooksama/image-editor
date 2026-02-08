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
import { Intl } from '@language/index';

export interface IProps {}

/**
  'ctrl+c', // 复制 -
  'ctrl+v', // 粘贴 -
  'ctrl+s', // 保存项目 -
  'ctrl+x', // 剪切选中元素 -
  'ctrl+-', // 居中缩小画布 -
  'ctrl+=', // 居中放大画布 -
  'ctrl+0', // 将画布缩放至适合屏幕大小 -
  'ctrl+a', // 全选 -
  'ctrl+d', // 取消选择 -
  'ctrl+z', // 撤销 -
  'ctrl+shift+z', // 重做 -
  'ctrl+]', // 将选中图层向上移动一层 -
  'ctrl+shift+]', // 将选中图层移到最上面 -
  'ctrl+[', // 将选中图层向下移动一层 -
  'ctrl+shift+[', // 将选中图层移到最下面 -
  'shift+up', // 上移10px -
  'shift+down', // 下移10px -
  'shift+left', // 左移10px -
  'shift+right', // 右移10px -
  'up', // 上移1px -
  'down', // 下移1px -
  'left', // 左移1px -
  'right', // 右移1px -
  'delete', // 删除选中元素 -
 */
export default function KeyboardModal(props: IProps) {
  const [visible, setVisible] = useState(false);

  const items = [
    {
      name: 'copy',
      win: 'Ctrl + C',
      mac: '⌘ + C',
      icon: <Copy theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'cut',
      win: 'Ctrl + X',
      mac: '⌘ + X',
      icon: <Clipboard theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'paste',
      win: 'Ctrl + V',
      mac: '⌘ + V',
      icon: <Intersection theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'select_all',
      win: 'Ctrl + A',
      mac: '⌘ + A',
      icon: <Intersection theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'deselect',
      win: 'Ctrl + D',
      mac: '⌘ + D',
      icon: <Intersection theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'move_up_layer',
      win: 'Ctrl + ]',
      mac: '⌘ + ]',
      icon: <Intersection theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'move_down_layer',
      win: 'Ctrl + [',
      mac: '⌘ + [',
      icon: <Intersection theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'move_to_top',
      win: 'Ctrl + Shift + ]',
      mac: '⌘ + Shift + ]',
      icon: <Intersection theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'move_to_bottom',
      win: 'Ctrl + Shift + [',
      mac: '⌘ + Shift + [',
      icon: <Intersection theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'delete',
      win: 'Delete/Backspace',
      mac: 'Delete/Backspace',
      icon: <Delete theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'undo',
      win: 'Ctrl + Z',
      mac: '⌘ + Z',
      icon: <Return theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'redo',
      win: 'Ctrl + Shift + Z',
      mac: '⌘ + Shift + Z',
      icon: <Return style={{ transform: `scaleX(-1)` }} theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'move_right_1px',
      win: '→',
      mac: '→',
      icon: <ArrowCircleRight theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'move_left_1px',
      win: '←',
      mac: '←',
      icon: <ArrowCircleLeft theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'move_up_1px',
      win: '↑',
      mac: '↑',
      icon: <ArrowCircleLeft theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'move_down_1px',
      win: '↓',
      mac: '↓',
      icon: <ArrowCircleLeft theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'move_left_10px',
      win: 'Shift + ←',
      mac: 'Shift + ←',
      icon: <ArrowCircleLeft theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'move_up_10px',
      win: 'Shift + ↑',
      mac: 'Shift + ↑',
      icon: <ArrowCircleLeft theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'move_down_10px',
      win: 'Shift + ↓',
      mac: 'Shift + ↓',
      icon: <ArrowCircleLeft theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'canvas_zoom_in',
      win: 'Ctrl + +',
      mac: '⌘ + +',
      icon: <ZoomIn theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'canvas_zoom_out',
      win: 'Ctrl + -',
      mac: '⌘ + -',
      icon: <ZoomOut theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'canvas_fit',
      win: 'Ctrl + 0',
      mac: '⌘ + 0',
      icon: <ZoomOut theme="outline" size="20" fill="var(--theme-icon)" />,
    },
    {
      name: 'save',
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
        title="快捷键"
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
                    <Intl name={d.name} />
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
                    <Intl name={d.name} />
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
