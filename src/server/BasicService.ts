import axios from 'axios';
import { user } from '@stores/user';
import { config } from '@config/index';
import { server } from './abort';
import { Toast } from '@douyinfe/semi-ui';

const globalOptions = {
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    'Accept': 'application/json',
    'Authorization': user.getToken(),
    // Access-Control-Allow-Origin 헤더 제거 (이는 서버에서 설정해야 함)
  },
};

export type Res = {
  code: number;
  data: any;
  message: string;
};

export type Method = 'get' | 'post' | 'delete' | 'put';

export default class BasicService {
  baseURL: string;
  abortKeys: Record<string, string> = {};

  constructor(baseURL = '') {
    this.baseURL = baseURL || config.apiHost;  // config.apiHost를 기본값으로 사용
  }

  _setRqHeaderToken(token: string) {
    user.setToken(token);
    globalOptions.headers.Authorization = token;
  }

  get(url: string, options?: any) {
    return this._request('get', url, null, options);
  }

  post(url: string, data?: any, options?: any) {
    return this._request('post', url, data, options);
  }

  put(url: string, data?: any, options?: any) {
    return this._request('put', url, data, options);
  }

  delete(url: string, options?: any) {
    return this._request('delete', url, {}, options);
  }

  abort(key: string) {
    if (key) {
      console.log('this.abortKeys', this.abortKeys[key]);
      const url = this.abortKeys[key];
      server.abort(url);
      delete this.abortKeys[key];
    } else {
      console.warn('abort는 key 매개변수를 전달해야 합니다');
    }
  }

  abortAll() {
    server.abortAll();
  }

  _request(method: Method, url: string, data: any, options: any = {}) {
    // abort 매개변수 설정
    // if (options.abortID) {
    //   this.abortKeys[options.abortID] = url;
    // }

    const headers = Object.assign({}, globalOptions.headers, options.headers);
    const opt = {
      baseURL: this.baseURL,
      withCredentials: false,
      method,
      url: /https?:\/\//.test(url) ? url : config.apiHost + url,
      data: data,
      params: Object.assign(options.params || {}),
      cancelToken: new axios.CancelToken(cancel => {
        server.add(url, cancel);
      }),
      headers 
    };

    // axios.defaults.withCredentials = true;
    return axios(opt)
      .then((res: any) => {
        res = res.data as Res;
        // 성공 후 abort 제거
        server.remove(url);
        if (options.jsonFile) {
          return res.data;
        }
        if (res.code === 1001 || res.code === 1002) {
          console.error('로그인 만료, 페이지를 다시 로그인하세요');
          Toast.error(res.message);
          user.clearUserInfo();
          return [null, '로그인 만료'];
        }
        if (res.error) {
          console.log('res.error', res.error);
          return [null, res.error.error_code.message, res];
        }
        if (res.code !== 0) {
          return [null, res.message, res];
        } else {
          return [res.data || res || true, null, res];
        }
      })
      .catch(err => {
        if (err?.__CANCEL__) {
          console.warn('요청이 취소되었습니다');
          return Promise.reject('요청이 취소되었습니다');
        }
        console.error('err', err);
        return Promise.reject(err);
      });
  }
}
