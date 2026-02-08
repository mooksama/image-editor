import styles from './sources.module.less';
import { Tabs, TabPane, Empty } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import Layers from './Layers';
import Pages from './Pages';
import { editor } from '@stores/editor';
import Projects from './projects/Projects';

export interface IProps {
  show: boolean;
}

function Sources(props: IProps) {
  return (
    <div className={styles.sources} style={{ display: props.show ? 'block' : 'none' }}>
      <Tabs
        className={styles.tabs}
        type="line"
        activeKey={editor.sourceType}
        onChange={activeKey => {
          editor.sourceType = activeKey;
        }}
      >
        <TabPane tab="프로젝트" itemKey="projects">
          {editor.sourceType === 'projects' && <Projects />}
        </TabPane>
        <TabPane tab="다중 페이지" itemKey="pages">
          <Pages />
        </TabPane>
        <TabPane tab="레이어" itemKey="layers">
          <Layers />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default observer(Sources);
