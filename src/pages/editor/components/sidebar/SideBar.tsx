import '@icon-park/react/styles/index.css';
import styles from './sidebar.module.less';
import logo1 from '@images/logo1.png';
import logo2 from '@images/logo2.png';
import { UploadOne, PictureOne, Stickers, Mosaic, MoreTwo, Text, Page } from '@icon-park/react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { editor } from '@stores/editor';
import KeyboardModal from './KeyboardModal';
// import { Button } from '@douyinfe/semi-ui';
import { theme } from '@theme';

export interface ISideBarProps {}

function SideBar(props: ISideBarProps) {
  const fill = 'var(--theme-icon)';
  editor.themeUpdateKey;
  return (
    <div className={styles.sidebar}>
      <span className={styles.logo}>
        <a target="_blank" href="/">
          <img src={theme.getTheme() === 'dark' ? logo1 : logo2} alt="" />
        </a>
      </span>
      <div className={styles.menus + ' scroll'}>
        <ul>
          {[
            {
              icon: <Page theme="outline" size="24" fill={fill} />,
              type: 'template',
              name: '모판', // '模版' -> '모판'
            },
            {
              icon: <UploadOne theme="outline" size="24" fill={fill} />,
              type: 'my',
              name: '내것', // '我的' -> '내 것'
            },
            {
              icon: <PictureOne theme="outline" size="24" fill={fill} />,
              type: 'image',
              name: '그림', // '图片' -> '그림'
            },
            {
              icon: <Text theme="outline" size="24" fill={fill} />,
              type: 'text',
              name: '텍스트', // '文本' -> '텍스트'
            },
            {
              icon: <Mosaic theme="outline" size="24" fill={fill} />,
              type: 'background',
              name: '배경', // '背景' -> '배경'
            },
            {
              icon: <Stickers theme="outline" size="24" fill={fill} />,
              type: 'svg',
              name: '스티커', // '贴纸' -> '스티커'
            },
            {
              icon: <MoreTwo theme="outline" size="24" fill={fill} />,
              type: 'more',
              name: '더보기', // '更多' -> '더보���'
            },
          ].map((d, i) => {
            return (
              <li
                onClick={() => {
                  editor.setSourceType(d.type as any);
                }}
                key={d.type}
                className={classNames(d.type === editor.sourceType ? styles.active : '')}
              >
                <i>{d.icon}</i>
                <p>{d.name}</p>
              </li>
            );
          })}
        </ul>
      </div>
      <div className={styles.bottom}>
        <KeyboardModal />
      </div>
    </div>
  );
}

export default observer(SideBar);
