/**
 * Object to url args
 * @param  {Object} obj 参数对象
 * @return {String}     转换后的参数
 */

function param(obj) {
  let str = [];

  for(let p in obj) {
    if(obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }

  return str.join('&');
}

export default param;
