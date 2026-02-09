import { action, observable, transaction } from 'mobx';
import { storage, crypto } from '@utils/index';

/**
 * @desc 외부에서 전달된 props 데이터를 저장합니다.
 */
class User {
  @observable token: string = crypto.encrypt(storage.local.get('token')) || ''; // 외부에서 전달된 매개변수
  @observable info: any = null; // 외부에서 전달된 매개변수

  /**
   * 사용자 정보를 설정합니다.
   * @param {*} info
   */
  @action
  setUserInfo = (info: any) => {
    this.info = info;
  };

  @action
  getUserInfo = () => {
    return this.info;
  };

  @action
  getToken = () => {
    return this.token;
  };

  @action
  setToken = (token: string) => {
    token = token;
    this.token = token;
    storage.local.set('token', crypto.decrypt(token));
  };

  @action
  updateUserInfo = (values: { [x: string]: any }) => {
    transaction(() => {
      for (let key in values) {
        this.info[key] = values[key];
      }
    });
  };

  @action
  logout = async () => {
    user.clearUserInfo();
    (window as any).RouterHistory.push('/');
  };

  @action
  clearUserInfo = () => {
    transaction(() => {
      this.info = null;
      this.token = '';
    });
    storage.local.remove('token');
  };
}

const user = new User();

export { user, User };
