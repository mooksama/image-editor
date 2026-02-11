import Source from '@pages/editor/common/source';
import { editor } from '@stores/editor';
import styles from './template.module.less';
import $ from 'jquery';
import { util } from '@utils/index';
import { transaction } from 'mobx';
// import { BasePage } from '@pages/editor/core/types/data';
import { formatH5DSImageTemplate } from './formatData';
import { config } from '@config/index';

export interface IProps {
  show: boolean;
}

// 로드 여부 판단, 한 번만 로드
let hasRender = false;

export default function Template(props: IProps) {
  if (!hasRender) {
    if (props.show) {
      hasRender = true;
    } else {
      return null;
    }
  }

  return (
    <div style={{ height: '100%', display: props.show ? 'block' : 'none' }}>
      <Source
        type="template"
        item={(d: any) => {
          return <img src={d.thumb} />;
        }}
        itemClassName={styles.imgItem}
        addItem={async item => {
          console.log(item);
          const res = await $.get(config.templateHost + '/api/v1/open/templates/' + item.templateId);
          try {
            // H5DS 이미지 데이터 호환
            const json = util.reJSON(res.data.data.appData).pages[0];
            // console.log('json', json);
            const newPage = formatH5DSImageTemplate(json, item.thumb);
            transaction(() => {
              editor.data.pages.push(newPage);
              console.log('editor.data', editor.store.app);
              editor.selectPageId = newPage.id;
              editor.updateViewKey = util.createID();
              editor.store.emitControl([]);
              editor.updateOption();
              editor.selectedElementIds = [];
              setTimeout(() => {
                editor.store.autoViewSize();
                editor.record();
              }, 10);
            });
          } catch (e) {
            console.error('템플릿 데이터 파싱 오류', e);
          }
          // const json = await $.get(item.url + '?t=' + +new Date());
        }}
      />
    </div>
  );
}
