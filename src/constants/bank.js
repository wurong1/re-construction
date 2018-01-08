/**
 * Created by eng0409 on 16-12-8.
 */
let bank = {
  '中国工商银行': [{
    Name: '中国工商银行'
  }],
  '中国农业银行': [{
    Name: '中国农业银行'
  }],
  '中国银行': [{
    Name: '中国银行'
  }],
  '中国建设银行': [{
    Name: '中国建设银行'
  }],
  '交通银行': [{
    Name: '交通银行'
  }],
  '中信银行': [{
    Name: '中信银行'
  }],
  '中国光大银行': [{
    Name: '中国光大银行'
  }],
  '华夏银行': [{
    Name: '华夏银行'
  }],
  '中国民生银行': [{
    Name: '中国民生银行'
  }],
  '广东发展银行': [{
    Name: '广东发展银行'
  }],
  '深圳发展银行': [{
    Name: '深圳发展银行'
  }],
  '招商银行': [{
    Name: '招商银行'
  }],
  '兴业银行': [{
    Name: '兴业银行'
  }],
  '上海浦东发展银行': [{
    Name: '上海浦东发展银行'
  }],
  '北京银行': [{
    Name: '北京银行'
  }],
  '上海银行': [{
    Name: '上海银行'
  }],
  '城市商业银行': [{
    Name: '城市商业银行'
  }],
  '农村信用合作社': [{
    Name: '农村信用合作社'
  }],
  '农村商业银行': [{
    Name: '农村商业银行'
  }],
  '盛京银行': [{
    Name: '盛京银行'
  }],
  '天津银行': [{
    Name: '天津银行'
  }],
  '宁波银行': [{
    Name: '宁波银行'
  }],
  '重庆银行': [{
    Name: '重庆银行'
  }],
  '温州银行': [{
    Name: '温州银行'
  }],
  '南京银行': [{
    Name: '南京银行'
  }],
  '江苏银行': [{
    Name: '江苏银行'
  }],
  '深圳平安银行': [{
    Name: '深圳平安银行'
  }],
  '平安银行': [{
    Name: '平安银行'
  }],
  '中国邮政储蓄银行': [{
    Name: '中国邮政储蓄银行'
  }]
};
function format(obj) {
  let options = new Array();
  for( let name in obj) {
    if(!!name) {
      options.push({'value': name, 'label': name});
    }
  }
  return options;
}
export default format(bank);
