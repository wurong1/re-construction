import fetch from 'axios';
import param from './param';
import { notification, message } from 'antd';

/**
 * 模拟Promise 类
 *
 * 该类实现自动给传入的promise实例，调用then 方法时，主动加入了一个onReject参数 promise.then(onResolve, onReject)
 * 同时支持自定义传入catch方法 或者 onReject 函数
 * 可以解决不传入onReject函数，或导致JS报错的问题
 * 构造函数需要传入一个Promise实例作为，初始化条件
 */
class PromiseSimulator {
  constructor(promise) {
    if ( !promise ) throw new Error('Promise instance required.');
    this.promise = promise;
  }

  noop(e) {
    this.catchedError = e;
  }

  then(then, catchFn) {
    let catchFn1 = catchFn;
    if (!catchFn1) {
      catchFn1 = (e) => this.noop(e);
    }

    this.promise.then(then, catchFn1);
    return this;
  }

  catch(catchFn) {
    this.promise.catch(catchFn);
    return this;
  }
}

function checkStatus(response) {
  if(response.status >= 200 && response.status < 300) {
    return response.data;
  }
  let error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function remote(options) {
  let fetchOptions = {};

  options.method = options.method || 'GET';

  fetchOptions.headers = {
    'Accept': 'application/json;charset=utf-8, text/javascript, */*;',
    'Content-Type': 'application/json; charset=utf-8',
    'x-requested-with': 'xmlhttprequest'
  };
  fetchOptions.withCredentials = true;

  if(options.method.toUpperCase() === 'GET' && options.data) {
    fetchOptions.params = options.data;
  } else {
    fetchOptions.method = options.method;
    fetchOptions.data = options.data;
  }

  let t = fetch(options.url, fetchOptions)
      .then(checkStatus)
      // .then(res => res.json())
      .then(json => {
        if(json.info && json.info[0] && json.info[0].name === 'LOGIN_REDIRECT_URL') {
          window.location = json.info[0].msg;
          return {};
        }

        if(json.status && json.status === 'FAILED') {
          throw new Error(json.errorData.message);
        } else if (json.value && typeof(json.value) === 'boolean' && !json.value) {
          throw new Error('操作失败，请联系我们或稍后再试');
        } else {
          return json;
        }
      })
      .catch(
          e => {
            const { data = {} } = e.response || {};
            // notification.error({
            //   message: '',
            //   description: e.message,
            // });
            !options.hideError && notification.error({
              message: '',
              description: e.message,
            });
            if (e.response && e.response.status === 500) {
              message.error(data.errorData && data.errorData.message);
            }
            // if(e.response && (e.response.status === 403 || e.response.status === 404)) {
            //   window.location = '/index.html#/403';
            // }

            return Promise.reject(e);
          }
      );

  return new PromiseSimulator(t);
}

export {
    remote
};
