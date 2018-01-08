import React, {Component} from 'react';
import {Upload, Button} from 'antd';

class FileUpload extends Component {

  beforeUpload (file) {
    // 上传文件类型数组定义
    const fileTypeArr = this.props.rules ? this.props.rules : [];
    // 上传文件大小限制50M
    const maxSize = this.props.maxSize || 50;
    const fileLimit = file.size / 1000 / 1000 < maxSize;
    // 上传文件类型限制提示
    const filePrompt = this.props.typePrompt ? this.props.typePrompt : '';
    const reg = new RegExp(/.*\.(\w+)$/);
    const fileYtpe = reg.exec(file.name) && reg.exec(file.name)[1];
    let   isFileType = fileTypeArr.filter(data => data === fileYtpe).length > 0 ? true : false;
    // let message = '';
    // fileTypeArr.forEach((data, idx) => {
    //   const s = data.split('/')[1];
    //   if(idx === (fileTypeArr.length - 1)) {
    //     message += s;
    //   }else {
    //     message += s + '，';
    //   }
    // });
    if (!isFileType) {
      msgBoxShow('上传的的文件格式只能为' + filePrompt + '!', 'faild', null, 5);
    }
    if(!fileLimit) {
      msgBoxShow('你上传的文件超过了' + maxSize + '!', 'faild', null, 3);
    }
    if(isFileType && fileLimit) {
      this.props.setTimer(file);
    }
    return isFileType && fileLimit;
  }

  render() {
    return(
      <Upload  beforeUpload={this.beforeUpload.bind(this)}
               showUploadList={false} name={this.props.name}
               action={this.props.action} onChange={this.props.onChange}
               data={this.props.data} headers={this.props.headers} multiple={!this.props.isLimit}>
         <Button type="ghost">
              上传文件
         </Button>
      </Upload>
    );
  }
 }
export default FileUpload;

