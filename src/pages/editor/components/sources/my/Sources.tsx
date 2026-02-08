import styles from './sources.module.less';
import { Tabs, TabPane, Empty } from '@douyinfe/semi-ui';
import List from './List';
import { observer } from 'mobx-react';
import { user } from '@stores/user';
import Login from '@components/login';
import { IllustrationNoAccess, IllustrationNoAccessDark } from '@douyinfe/semi-illustrations';
export interface IProps {
  show: boolean;
}

function Sources(props: IProps) {
  return (
    <div className={styles.sources} style={{ display: props.show ? 'block' : 'none' }}>
      {user.info ? (
        <Tabs lazyRender={true} className={styles.tabs} type="line">
          <TabPane tab="현재 프로젝트" itemKey="1">
            <List type="local" />
          </TabPane>
          <TabPane tab="전체 소재" itemKey="2">
            <List type="cloud" />
          </TabPane>
        </Tabs>
      ) : (
        <div className={styles.unlogin}>
          <span>
            <Empty
              image={<IllustrationNoAccess style={{ width: 150, height: 150 }} />}
              darkModeImage={<IllustrationNoAccessDark style={{ width: 150, height: 150 }} />}
              description={
                <div className={styles.loginTip}>
                  아직 로그인하지 않았습니다. 먼저
                  <Login>
                    <a>로그인</a>
                  </Login>
                </div>
              }
              style={{ padding: 30 }}
            />
          </span>
        </div>
      )}
    </div>
  );
}

export default observer(Sources);
