import styles from './list.module.less';
import { SplitButtonGroup, Dropdown, Button, Space, Modal, Select, Upload, Toast } from '@douyinfe/semi-ui';
import { Down, Upload as UploadIcon, DeleteFive, Close } from '@icon-park/react';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { getUploadBeforeData } from '@pages/editor/tools/uploadBeforeData';
import { pubsub, util } from '@utils/index';
import { server } from './server';
import { user } from '@stores/index';
import SourceList from '@pages/editor/common/source/SourceList';
import { Progress, Checkbox, Empty } from '@douyinfe/semi-ui';
import { MusicRhythm, Plus, Like } from '@icon-park/react';
import { editor } from '@stores/index';
import { addImageItem } from '../addItem';
import { IllustrationNoContent } from '@douyinfe/semi-illustrations';
/* 이하 1.13.0 버전 이후 제공 */
import { IllustrationNoContentDark } from '@douyinfe/semi-illustrations';
import { config } from '@config/index';

export interface IProps {
  type: 'local' | 'cloud';
}

export interface UploadItem {
  fileInfoSuccess?: boolean;
  id: string;
  status: 'ready' | 'uploadStart' | 'uploading' | 'decoding' | 'uploaded';
  progress: number; // 현재 진행률
  type?: string; // 파일 유형
  name?: string;
  size?: number; // 파일 크기
  thumb?: string; // 썸네일
  naturalHeight?: number; // 이미지 실제 크기
  naturalWidth?: number;
  duration?: number; // 길이
  rotate?: boolean; // 비디오가 회전되었는지 여부
  hasAudioTrack?: boolean; // 비디오에 오디오 트랙이 있는지 여부
  videoWidth?: number; // 비디오 실제 크기
  videoHeight?: number;
  wave?: string; // 음파 json 데이터
  frames?: string; // 1초 단위의 프레임 이미지
}

export default function List(props: IProps) {
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState(null);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [hasMore, setHasMore] = useState(true);
  const [checkboxs, setCheckboxs] = useState([]);
  const [recordAudioVisible, setRecordAudioVisible] = useState(false);
  const [cates, setCates] = useState([]);
  const uploadRef = useRef();

  const menu: any = [
    // { node: 'item', name: '휴대폰 업로드', onClick: () => console.log('편집 항목 클릭') },
    {
      node: 'item',
      name: (
        <span
          onClick={() => {
            setRecordAudioVisible(true);
          }}
        >
          온라인 녹음
        </span>
      ),
    },
    // { node: 'item', name: '텍스트 음성 변환' },
  ];
  // 캐시 info 데이터
  const cacheInfoData = useRef<Record<string, UploadItem>>({});
  const params = useRef<any>({
    app_id: props.type === 'cloud' ? '' : editor.appid,
    page: 1,
    page_size: 20,
    keyword: '',
    category_id: '',
  });
  // category_id가 변경되면 items를 다시 설정해야 하며, 무한 스크롤에 추가하지 않습니다.
  const categoryOldId = useRef('');

  const getList = useCallback(async () => {
    const [res, err] = await server.getUserMaterial({ ...params.current });
    if (!err) {
      let list = [];
      if (params.current.category_id !== categoryOldId.current) {
        categoryOldId.current = params.current.category_id;
        list = [...res.data];
      } else {
        list = [...(items || []), ...res.data];
      }
      setItems(list);
      setHasMore(res.total > list.length);
    }
  }, [items]);

  const getCates = useCallback(async () => {
    const [res, err] = await server.getCategoryList({ page: 1, type: 'material', page_size: 99 });
    setCates(res.data || []);
  }, []);

  useEffect(() => {
    getList();
    getCates();
  }, []);

  useEffect(() => {
    // 파일 업로드가 클라우드에 동기화됩니다.
    if (props.type === 'cloud') {
      pubsub.subscribe('addItemToCloudList', (_msg, item) => {
        setItems([item, ...(items || [])]);
      });
    }

    return () => {
      if (props.type === 'cloud') {
        pubsub.unsubscribe('addItemToCloudList');
      }
    };
  }, [items]);

  // 업로드 중인 정보 표시
  const uploadList = Object.values(cacheInfoData.current)
    .map(d => {
      return {
        id: d.id,
        name: d.name,
        type: d.type,
        urls: { thumb: d.thumb },
        attrs: {
          width: d.naturalWidth || d.videoWidth || 200,
          height: d.naturalHeight || d.videoHeight || 180,
        },
        status: d.status,
        progress: d.progress,
      };
    })
    .filter(d => {
      return d.status !== 'uploaded';
    });
  // console.log('uploadList', uploadList);

  const sourceItems = [...uploadList, ...(items || [])];

  return (
    <>
      {checkboxs.length !== 0 && (
        <div className={styles.checkboxBtns}>
          <span>선택됨: {checkboxs.length}개</span>
          <Space>
            <Button
              icon={<DeleteFive theme="filled" size="14" fill="var(--semi-color-danger)" />}
              onClick={() => {
                Modal.confirm({
                  title: '이 자료를 삭제하시겠습니까?',
                  content: '삭제 후 복구할 수 없습니다. 신중하게 작업하세요.',
                  onOk: async () => {
                    // 삭제 확인
                    const [res, err] = await server.deleteMaterial([...checkboxs]);
                    if (!err) {
                      Toast.success('삭제 성공!');
                      setItems(
                        items.filter(d => {
                          return !checkboxs.includes(d.id);
                        }),
                      );
                      setCheckboxs([]);
                    }
                  },
                });
              }}
              type="danger"
            >
              삭제
            </Button>
            <Button
              icon={<Close theme="filled" size="14" fill="var(--semi-color-primary)" />}
              onClick={() => {
                setCheckboxs([]);
              }}
            >
              취소
            </Button>
          </Space>
        </div>
      )}
      {checkboxs.length === 0 && (
        <div className={styles.btns}>
          {props.type === 'local' ? (
            <Upload
              accept=".gif, .png, .jpeg, .jpg, .svg"
              action={'/api/v1/common/upload/form'}
              uploadTrigger="auto"
              headers={{
                Authorization: user.getToken(),
              }}
              ref={uploadRef}
              maxSize={500 * 1024}
              multiple={true}
              limit={10}
              draggable={true}
              showUploadList={false}
              className={styles.btn1}
              onAcceptInvalid={v => {
                console.log('>>>>', v);
              }}
              beforeUpload={async v => {
                if (!user.info) {
                  Toast.warning('로그인 해주세요');
                  return {
                    shouldUpload: false,
                    status: 'error',
                  };
                }

                const ftype = v.file.fileInstance.type.split('/')[0];
                cacheInfoData.current[v.file.name] = {
                  id: v.file.uid,
                  progress: 0,
                  status: 'ready',
                  thumb: ftype === 'image' ? v.file.url : '',
                  type: v.file.fileInstance.type,
                  size: v.file.fileInstance.size,
                  name: v.file.name,
                };
                // blob url 가져오기
                getUploadBeforeData(
                  v.file.url,
                  util.getFileTypeByURL('', v.file.name.split('.')[1]),
                  server.uploadBase64,
                )
                  .then(info => {
                    return Object.assign(cacheInfoData.current[v.file.name], {
                      fileInfoSuccess: true, // 파일 사전 처리 데이터 가져오기 성공
                      ...info,
                    });
                  })
                  .catch(err => {
                    console.error('프레임 캡처 예외는 백엔드로 처리', err);
                    // 예외는 백엔드로 처리
                    Object.assign(cacheInfoData.current[v.file.name], {
                      fileInfoSuccess: true, // 파일 사전 처리 데이터 가져오기 성공
                    });
                  });
                Object.assign(cacheInfoData.current[v.file.name], {
                  status: 'uploadStart',
                  progress: 0,
                });
                forceUpdate();
                return {
                  shouldUpload: true,
                  status: 'success',
                };
              }}
              onProgress={(p, file, all) => {
                cacheInfoData.current[file.name].status = 'uploading';
                cacheInfoData.current[file.name].progress = p;
                forceUpdate();
              }}
              onSuccess={async (res, file, all) => {
                if (res.code !== 0) {
                  Toast.error(res.message);
                  cacheInfoData.current[file.name].status = 'uploaded';
                  forceUpdate();
                  return;
                }
                cacheInfoData.current[file.name].status = 'decoding';
                forceUpdate();

                // 인코딩 중일 수 있으며, 기다려야 합니다.
                // 대기
                while (!cacheInfoData.current[file.name].fileInfoSuccess) {
                  console.log('프레임 캡처 대기');
                  await util.sleep(1000);
                }
                console.log('프레임 캡처 완료!');

                const { name, thumb, progress, id, status, ...other } = cacheInfoData.current[file.name];
                const attrs = {};
                for (let key in other) {
                  if (key.split('')[0] !== '_') {
                    attrs[key] = other[key];
                  }
                }
                const url = res.data.storage_path;
                // 자료실에 저장
                const [item, err] = await server.createUserMaterial({
                  app_id: editor.appid,
                  name: name,
                  urls: { url, thumb },
                  attrs,
                });
                cacheInfoData.current[file.name].status = 'uploaded';
                forceUpdate();
                if (props.type === 'local') {
                  items.unshift(item);
                  setItems([...items]);
                } else {
                  pubsub.publish('addItemToCloudList', item);
                }
              }}
              onError={(...v) => console.log('error', v)}
            >
              <Button
                iconPosition="left"
                theme="solid"
                type="primary"
                block
                icon={<UploadIcon theme="outline" size="20" fill="#FFF" />}
              >
                자료 업로드
              </Button>
            </Upload>
          ) : (
            <Select
              defaultValue="루트 디렉토리"
              onChange={v => {
                Object.assign(params.current, {
                  page: 1,
                  page_size: 20,
                  keyword: '',
                  category_id: v,
                });
                setItems([]);
                getList();
              }}
              style={{ width: '100%' }}
            >
              <Select.Option value={0}>根目录</Select.Option>
              {cates.map(d => {
                return (
                  <Select.Option key={d.id} value={d.id}>
                    &nbsp;&nbsp;&nbsp;{d.name}
                  </Select.Option>
                );
              })}
            </Select>
          )}
        </div>
      )}
      <div className={styles.list + ' scroll'} id={`sourceItemsScrollDOM_${props.type}`}>
        {!sourceItems.length && (
          <div className={styles.emptySource}>
            <Empty
              image={<IllustrationNoContent style={{ width: 150, height: 150 }} />}
              darkModeImage={<IllustrationNoContentDark style={{ width: 150, height: 150 }} />}
              description={<div className={styles.loginTip}>이 프로젝트에 자료가 없습니다. 먼저 업로드해 주세요.</div>}
              style={{ padding: 30 }}
            />
          </div>
        )}
        {!!sourceItems.length && (
          <SourceList
            type={props.type}
            hasMore={hasMore}
            checkboxs={checkboxs}
            onChangeCheckboxs={id => {
              if (checkboxs.includes(id)) {
                setCheckboxs(checkboxs.filter(d => d !== id));
              } else {
                setCheckboxs([...checkboxs, id]);
              }
            }}
            items={sourceItems.map(d => {
              return {
                ...d,
                thumb: d.urls.thumb || d.attrs.thumb,
                width: d.attrs.width || d.attrs.naturalWidth || d.attrs.videoWidth || 200,
                height: d.attrs.height || d.attrs.naturalHeight || d.attrs.videoHeight || 160,
              };
            })}
            next={() => {
              console.log('next--->');
              params.current.page++;
              getList();
            }}
            item={(d: any) => {
              return (
                <>
                  {d.progress !== undefined && (
                    <span className={styles.progress}>
                      {d.status === 'ready' && <span className={styles.tips}>업로드 준비중</span>}
                      {['uploadStart', 'uploading', 'decoding'].includes(d.status) && (
                        <Progress percent={d.progress} strokeWidth={2} showInfo type="circle" width={50} />
                      )}
                      {/* {d.status === 'decoding' && <span className={styles.tips}>인코딩 중</span>} */}
                      {d.status === 'uploaded' && <span className={styles.tips}>업로드 완료</span>}
                    </span>
                  )}
                  {d.status !== 'ready' && d.type === 'audio' ? (
                    <span className={styles.myAudioItem}>
                      <MusicRhythm theme="filled" size="60" fill="#009006" />
                    </span>
                  ) : (
                    <img src={editor.store.setURL(d.urls?.thumb)} />
                  )}
                  {['audio', 'video'].includes(d.type) && (
                    <i className={styles.time}>{util.secToTime(d.attrs?.duration || 0, 'mm:ss')}</i>
                  )}
                </>
              );
            }}
            itemClassName={styles.myItem}
            addItem={addImageItem}
          />
        )}
      </div>
    </>
  );
}
