import '@theme/theme.less';
import React, { Component, createRef } from 'react';
// import { Redirect, Switch } from 'react-router-dom'; // 라우터
import { userService } from '@server/index';
import { pubsub, util } from '@utils/index';
import { config } from '@config/index';
import { renderRoutes } from 'react-router-config';
import { user } from '@stores/user';
// import { theme, ThemeName } from './theme';

interface AppProps {
  Router: any;
  routes: any;
  location?: any;
  context?: any;
}

class App extends Component<AppProps> {
  routerRef: React.RefObject<any>;

  constructor(props: AppProps) {
    super(props);
    this.routerRef = createRef();
    // theme.setTheme(ThemeName.DARK);
  }

  /**
   * URL에 토큰이 있으면 자동으로 토큰을 가져와서 자동 로그인 후 토큰을 제거합니다.
   */
  urlTokenLogin = () => {
    // URL에 토큰이 있으면 토큰 파라미터를 설정한 후 사용자 데이터를 가져옵니다.
    let token: any = util.getUrlQuery('token');
    if (token) {
      // URL에서 해당 토큰 파라미터를 제거합니다.
      window.history.pushState(null, '', util.delUrlParam('token'));
      token = decodeURI(token);
      user.setToken(token);
    }

    // 로그인이 필요합니다.
    if (token) {
      userService.getUserDetail();
      console.log('로그인이 필요합니다. 사용자 정보를 업데이트합니다.');
    }
  };

  componentDidMount() {
    (window as any).RouterHistory = this.routerRef.current.history;
    this.urlTokenLogin();

    // 다국어 처리
    pubsub.subscribe('setLanguage', () => {
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    pubsub.unsubscribe('setLanguage');
  }

  render() {
    const { Router, routes, ...otherProps } = this.props;

    return (
      <Router ref={this.routerRef} basename={config.basename} {...otherProps}>
        {renderRoutes(routes)}
      </Router>
    );
  }
}
export default App;
