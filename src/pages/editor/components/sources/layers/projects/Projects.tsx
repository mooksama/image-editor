import React, { useEffect, useState, useReducer, useCallback, useRef } from 'react';
import styles from './projects.module.less';
import { server } from './server';
import { Toast, Popover, Modal, Pagination, Button, SplitButtonGroup, Dropdown } from '@douyinfe/semi-ui';
import { More } from '@icon-park/react';
import { IconTreeTriangleDown } from '@douyinfe/semi-icons';
import { getInitData } from './initData';
import { pageSize } from '@pages/editor/core/config/config';
import { config } from '@config/index';
import { editor } from '@stores/editor';

export interface IProps {}

export default function Projects(props: IProps) {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const projectRef = useRef<HTMLDivElement>();
  const currentName = useRef<string>();
  const params = useRef({
    page: 1,
    page_size: 20,
    keyword: '',
    category_id: '0',
  });

  // 소재 가져오기
  const getList = async () => {
    const [res, err] = await server.getDraftList({ ...params.current }); //('draft', params.current, items, server.getDraftList);
    setTotal(res.total);
    setItems(res.data);
  };

  useEffect(() => {
    getList();
  }, []);

  return (
    <div ref={projectRef} className={styles.projects + ' scroll'}>
      <div className={styles.add}>
        <SplitButtonGroup style={{ marginRight: 10, width: '100%', overflow: 'hidden', borderRadius: 4 }}>
          <Button
            onClick={async () => {
              Modal.confirm({
                title: '새 프로젝트를 생성하시겠습니까?',
                content: '새 프로젝트 생성 전 현재 프로젝트를 저장해주세요',
                onOk: async () => {
                  const ndata = getInitData();
                  const [res, err] = await server.createVideo({
                    source_id: '', //소스 ID
                    category_id: 0, //카테고리 ID
                    name: ndata.name || '제목 없음', //이름
                    description: ndata.desc || '설명 없음', //설명
                    width: ndata.pages[0].width, //너비
                    height: ndata.pages[0].height, //높이
                    thumb: '', //썸네일 이미지 url
                    data: ndata,
                  });
                  if (err) {
                    Toast.error(err);
                    return;
                  }
                  location.href = `/editor/${res.id}`;
                },
              });
            }}
            theme="solid"
            type="primary"
            style={{ width: 'calc(100% - 34px)' }}
          >
            새 프로젝트
          </Button>
          <Dropdown
            contentClassName={styles.dropdown}
            //@ts-ignore
            menu={pageSize.map(d => {
              return {
                node: 'item',
                name: (
                  <section className={styles.section}>
                    {/* <span className={styles.name}>{d.icon}</span> */}
                    <span className={styles.name}>{d.name}</span>
                    <span className={styles.size}>
                      {d.width}
                      {d.unit} x {d.height}
                      {d.unit}
                    </span>
                  </section>
                ),
                onClick: async () => {
                  Modal.confirm({
                    title: '是否要新建项目？',
                    content: '新建项目前请先保存当前项目',
                    onOk: async () => {
                      const ndata = getInitData();
                      ndata.pages[0].width = d.width;
                      ndata.pages[0].height = d.height;
                      const [res, err] = await server.createVideo({
                        source_id: '', //소스 ID
                        category_id: 0, //카테고리 ID
                        name: ndata.name || '제목 없음', //이름
                        description: ndata.desc || '설명 없음', //설명
                        width: ndata.pages[0].width, //너비
                        height: ndata.pages[0].height, //높이
                        thumb: '', //썸네일 이미지 url
                        data: ndata,
                      });
                      if (err) {
                        Toast.error(err);
                        return;
                      }
                      location.href = `/editor/${res.id}`;
                    },
                  });
                },
              };
            })}
            trigger="click"
            position="bottomRight"
          >
            <Button theme="solid" type="primary" icon={<IconTreeTriangleDown />}></Button>
          </Dropdown>
        </SplitButtonGroup>
      </div>
      {items.map(item => {
        return (
          <div className={styles.item}>
            <Popover
              content={
                <ul className={styles.menus}>
                  <li
                    onClick={() => {
                      Modal.confirm({
                        title: '삭제하시겠습니까?',
                        content: '삭제 후 복구할 수 없습니다. 신중히 작업해주세요',
                        onOk: async () => {
                          await server.deleteDraft({ id: item.id });
                          params.current.page = 1;
                          // 현재 목록 업데이트
                          getList();
                        },
                      });
                    }}
                  >
                    삭제
                  </li>
                  <li
                    onClick={async () => {
                      const [res, err] = await server.copyDraft({ id: item.id });
                      if (err) {
                        Toast.error('복사 실패');
                      }
                      params.current.page = 1;
                      getList();
                      Toast.success('복사 성공');
                    }}
                  >
                    복사
                  </li>
                </ul>
              }
            >
              <div className={styles.more}>
                <More theme="outline" size="20" fill="var(--theme-icon)" />
              </div>
            </Popover>
            <a
              onClick={() => {
                Modal.confirm({
                  title: '프로젝트를 전환하시겠습니까?',
                  content: '전환 전 현재 프로젝트를 저장해주세요',
                  onOk: () => {
                    location.href = `/editor/${item.id}`;
                  },
                });
              }}
            >
              <div className={styles.pic}>
                <img
                  // style={{
                  //   width: (130 * item.width) / item.height,
                  //   height: 130,
                  // }}
                  src={item.thumb ? editor.store.setURL(item.thumb) : '/assets/images/img-null.png'}
                  alt=""
                />
              </div>
            </a>
            <input
              title="클릭하여 이름 수정"
              onFocus={e => {
                currentName.current = e.target.value;
              }}
              onBlur={async e => {
                if (e.target.value === currentName.current) return;
                item.name = e.target.value;
                const [res, err] = await server.updateDraft({ id: item.id, name: item.name });
                if (err) {
                  Toast.error(err);
                } else {
                  Toast.success('수정 완료!');
                }
              }}
              className={styles.name}
              defaultValue={item.name || '제목 없음'}
            />
          </div>
        );
      })}
      <Pagination
        popoverPosition="right"
        size="small"
        hoverShowPageSelect={true}
        total={total}
        pageSize={20}
        onPageChange={async page => {
          console.log('ppp', page);
          params.current.page = page;
          await getList();
          projectRef.current.scrollTop = 0;
        }}
        style={{ margin: '0 20px 20px 20px' }}
      ></Pagination>
    </div>
  );
}
