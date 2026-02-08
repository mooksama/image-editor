import styles from './header.module.less';
import { Popover, Button, Avatar, Toast, Tooltip } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import { LinkCloudSucess, LoadingFour, ViewList, Return, FolderCodeOne, Layers, Github, Info } from '@icon-park/react';
import { editor } from '@stores/editor';
import Export from './Export';
import User from './User';
import { user } from '@stores/user';
import Login from '@components/login';
import { useEffect, useReducer, useState } from 'react';
import { pubsub } from '@utils/pubsub';
import { util } from '@utils/index';
import { server } from '../../server';
// import { IconSpin } from '@douyinfe/semi-icons';
import { IconSun, IconMoon } from '@douyinfe/semi-icons';
import RecordTest from './RecordTest';
import { config } from '@config/index';
import { ViewData } from '@pages/editor/core/types/data';
import AboutUs from './AboutUs';
import { theme, ThemeName } from '@theme';

export interface IProps {}

function Header(props: IProps) {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  editor.layoutKeys.header;
  const [saveLoading, setSaveLoading] = useState(false);

  const undo = () => {
    const isok = editor.store.record.undo();
    if (isok) {
      forceUpdate();
      editor.recordUpdateTestKey = +new Date();
      editor.updateComponent('options');
    } else {
      Toast.error('이미 초기 상태로 되돌렸습니다');
    }
  };

  const redo = () => {
    const isok = editor.store.record.redo();
    if (isok) {
      forceUpdate();
      editor.recordUpdateTestKey = +new Date();
      editor.updateComponent('options');
    } else {
      Toast.error('이미 최종 상태로 복구했습니다');
    }
  };

  const saveApp = async (callback?: () => void, noToast?: boolean) => {
    console.log(JSON.stringify(editor.data));

    if (!user.info && !noToast) {
      // pubsub.publish('showLoginModal');
      Toast.error('먼저 로그인해주세요');
      return;
    }
    const ndataStr = JSON.stringify(editor.data);
    const ndata = util.toJS(editor.data) as ViewData;

    if (editor.lastUpdateAppData === ndataStr) {
      console.log('데이터 변경 없음, 업데이트 불필요');
      return;
    }

    setSaveLoading(true);
    const res = await editor.store.capture({
      // scale: util.toNum(160 / editor.pageData.height, 2),
    });

    // 이미지 축소
    const minBase = await util.scaleBase64(res.data, util.toNum(160 / editor.pageData.height, 2));

    console.log('res', res);
    const [ires] = await server.uploadBase64({
      content: minBase,
      name: util.createID() + '.png',
    });
    console.log('xxx', ires.storage_path);

    // 페이지 업데이트
    editor.pageData.thumb = ires.storage_path;

    editor.lastUpdateAppData = ndataStr;
    // 저장 시 appid가 없으면 먼저 생성
    if (!editor.appid) {
      const [res, err] = await server.createApp({
        source_id: '', //来源Id
        category_id: 0, //分类Id
        name: ndata.name || '제목 없음', //이름
        description: ndata.desc || '제목 없음', //설명
        width: ndata.pages[0].width, //宽度
        height: ndata.pages[0].height, //高度
        thumb: ires.storage_path, //封面图url
        data: ndata,
      });
      if (err) {
        return Toast.error(err);
      }
      editor.appid = res.id;
      // URL 설정
      window.history.pushState(null, null, '/editor/' + res.id);
    } else {
      const [res, err] = await server.updateApp({
        thumb: ires.storage_path,
        id: editor.appid,
        name: ndata.name,
        data: ndata,
        width: ndata.pages[0].width, //宽度
        height: ndata.pages[0].height, //高度
      });
      if (err) {
        return Toast.error(err);
      }
    }
    setSaveLoading(false);

    if (callback) {
      callback();
    }
  };

  useEffect(() => {
    pubsub.subscribe('keyboardSaveApp', (_msg, callback) => {
      saveApp(callback);
    });
    pubsub.subscribe('keyboardUndo', undo);
    pubsub.subscribe('keyboardRedo', redo);

    // 30초마다 자동 저장
    const timer = setInterval(() => {
      saveApp(undefined, true);
    }, 1000 * 30);

    return () => {
      clearInterval(timer);
      pubsub.unsubscribe('keyboardSaveApp');
      pubsub.unsubscribe('keyboardUndo');
      pubsub.unsubscribe('keyboardRedo');
    };
  }, []);

  return (
    <>
      <div className={styles.header}>
        <section className={styles.left}>
          <Tooltip content="프로젝트 목록">
            <a onClick={() => editor.setSourceType('projects')}>
              <FolderCodeOne theme="outline" size="20" fill="var(--theme-icon)" />
            </a>
          </Tooltip>
          <Tooltip content="다중 페이지">
            <a onClick={() => editor.setSourceType('pages')}>
              <ViewList theme="outline" size="20" fill="var(--theme-icon)" />
            </a>
          </Tooltip>
          <Tooltip content="레이어 목록">
            <a onClick={() => editor.setSourceType('layers')}>
              <Layers theme="outline" size="20" fill="var(--theme-icon)" />
            </a>
          </Tooltip>
          <Tooltip content="저장">
            <a style={{ pointerEvents: saveLoading ? 'none' : 'initial' }} onClick={() => saveApp()}>
              {saveLoading ? (
                <LoadingFour className={styles.loadingAnimate} theme="outline" size="20" fill="var(--theme-icon)" />
              ) : (
                <LinkCloudSucess theme="outline" size="20" fill="var(--theme-icon)" />
              )}
            </a>
          </Tooltip>
          <Tooltip content="되돌리기">
            <a onClick={undo}>
              <Return theme="outline" size="20" fill="var(--theme-icon)" />
            </a>
          </Tooltip>
          <Tooltip content="다시 실행">
            <a onClick={redo}>
              <Return style={{ transform: `scaleX(-1)` }} theme="outline" size="20" fill="var(--theme-icon)" />
            </a>
          </Tooltip>
          <input
            placeholder="프로젝트 제목 없음"
            className={styles.title}
            type="text"
            value={editor.data.name}
            onChange={e => {
              editor.data.name = e.target.value;
              forceUpdate();
            }}
          />
        </section>
        {/* <section className={styles.center}></section> */}
        <section className={styles.right}>
          <AboutUs />
          <a href="https://github.com/mtsee/image-editor" target="_blank" className={styles.git}>
            <Github theme="outline" size="22" fill="var(--theme-icon)" /> &nbsp; Github
          </a>
          <a href="https://gitee.com/676015863/image-editor" target="_blank" className={styles.git}>
            <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
              <path
                d="M512 960c-246.4 0-448-201.6-448-448s201.6-448 448-448 448 201.6 448 448-201.6 448-448 448z"
                fill="#D81E06"
              ></path>
              <path
                d="M721.664 467.968h-235.52a22.272 22.272 0 0 0-20.736 20.736v51.776c0 10.368 10.368 20.736 20.736 20.736H628.48c10.368 0 20.736 10.304 20.736 20.672v10.368c0 33.664-28.48 62.08-62.144 62.08H392.896a22.272 22.272 0 0 1-20.672-20.672V436.928c0-33.664 28.48-62.08 62.08-62.08h287.36a22.272 22.272 0 0 0 20.736-20.736v-51.84a22.272 22.272 0 0 0-20.736-20.672h-287.36A152.96 152.96 0 0 0 281.6 434.368v287.36c0 10.304 10.368 20.672 20.736 20.672h302.848c75.072 0 137.216-62.08 137.216-137.216v-116.48a22.272 22.272 0 0 0-20.736-20.736z"
                fill="#FFFFFF"
              ></path>
            </svg>
            &nbsp; Gitee
          </a>
          {/* <Button
            className={styles.openVipButton}
            theme="solid"
            type="tertiary"
            icon={<VipOne theme="filled" size="20" fill="#FF9431" />}
          >
            开通VIP
          </Button> */}
          <a
            className={styles.git}
            onClick={() => {
              if (theme.getTheme() === 'dark') {
                theme.setTheme(ThemeName.LIGHT);
                if (editor.ruler) {
                  editor.ruler.changeTheme('light');
                }
              } else {
                theme.setTheme(ThemeName.DARK);
                if (editor.ruler) {
                  editor.ruler.changeTheme('dark2');
                }
              }
              editor.themeUpdateKey = theme.getTheme();
            }}
          >
            {theme.getTheme() === 'light' ? (
              <IconMoon style={{ color: 'var(--theme-icon)' }} size="extra-large" />
            ) : (
              <IconSun style={{ color: 'var(--theme-icon)' }} size="extra-large" />
            )}
          </a>
          <Export />
          {user.info ? (
            <Popover content={<User />} position="bottomRight" trigger="click">
              <Avatar src={user.info.avatar} size="small" color="red" alt="Lisa LeBlanc">
                {user.info.nick_name}
              </Avatar>
            </Popover>
          ) : (
            <Login>
              <Button theme="solid" className={styles.login}>
                로그인/가입
              </Button>
            </Login>
          )}
        </section>
      </div>
      {/* {config.env === 'dev' && <RecordTest />} */}
    </>
  );
}

export default observer(Header);
