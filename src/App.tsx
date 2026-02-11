import '@theme/theme.less';
import React, { Component, createRef } from 'react';
import { userService } from '@server/index';
import { pubsub, util } from '@utils/index';
import { config } from '@config/index';
import { renderRoutes } from 'react-router-config';
import { user } from '@stores/user';
import { authService } from './services/authService'; // 추가!

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
  }

  /**
   * 如果url中存在token，会自动获取token，然后自动登录，之后再去掉token
   */
  urlTokenLogin = () => {
    // 如果url存在token，先设置token参数，再获取用户数据
    let token: any = util.getUrlQuery('token');
    if (token) {
      // 去掉url对应的token参数
      window.history.pushState(null, '', util.delUrlParam('token'));
      token = decodeURI(token);
      user.setToken(token);
    }

    // 需要登录
    if (token) {
      userService.getUserDetail();
      console.log('需要登录，更新用户信息');
    }
  };

  // 🆕 localStorage에서 사용자 정보 복원
  restoreUserSession = () => {
    const savedToken = authService.getToken();
    const savedUser = authService.getCurrentUser();
    
    console.log('Restoring session...', { savedToken, savedUser });
    
    if (savedToken && savedUser) {
      // MobX store에 복원
      user.setToken(savedToken);
      user.setUserInfo({
        id: savedUser.id,
        nick_name: savedUser.name,
        email: savedUser.email,
        avatar: '',
        vip_status: 0,
      });
      
      console.log('Session restored!', user.info);
    }
  };

  componentDidMount() {
    (window as any).RouterHistory = this.routerRef.current.history;
    this.urlTokenLogin();
    this.restoreUserSession(); // 🆕 추가!

    // 多语言处理
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