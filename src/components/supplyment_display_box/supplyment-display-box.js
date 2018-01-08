import React, {Component} from 'react';
import loanInfoData from '../../constants/loan-info-data';
import { remote } from '../../utils/fetch';
import { Modal, Table} from 'antd';
import FileUpload from '../file_upload/file-upload';
import {Line } from 'rc-progress';
import { fileConcept } from '../dynamic_form/dynamic-form';
import { imgTypeDivision } from '../file_display_box/file-display-box';

class SupplymentDisplayBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      modalData: [],
      imgLength: this.props.boxInfo.imgLength,
      name: this.props.boxInfo.name,
      imgPath: this.props.boxInfo.imgPath,
      fileType: this.props.supplyList ? this.props.supplyList.filter(data => data.type === this.props.boxInfo.type)[0].imgFileName : '',
      timerArry: [],
      progressArray: [],
      faildList: [],
      required: this.props.supplyList ? this.props.supplyList.filter(data => data.type === this.props.boxInfo.type)[0].required : ''
    };
  }

  componentWillMount() {
    const newImgPath = this.props.boxInfo.imgPath ? this.props.boxInfo.imgPath.split('path=')[1] : '';
    this.getOssPath(newImgPath);
  }

  getOssPath(path) {
    if (path && loanInfoData.ossDownloadMethod === 'FRONTEND') {
      const encodePath = encodeURIComponent(path);
      this.setState(() => {
        remote({
          method: 'GET',
          url: `/borrower/getImageAbsolutePath?key=${encodePath}`
        }).then(res => {
          this.setState({imgPath: res});
        });
      });
    }
  }

  getFileList(e) {
    e.preventDefault();
    remote({
      method: 'GET',
      url: '/borrower/getallloanimageforauditbytype?aid=' + loanInfoData.aId + '&loanAppId=' + loanInfoData.loanId + '&type=' + this.props.boxInfo.type + '&taskStatus=hold' + '&routingSystem=' + loanInfoData.routingSystem + '&conditionId=' + this.props.boxInfo.docId + '&appStatus=' + loanInfoData.loanStatus,
    }).then((data) => {
      this.showModal();
      this.setState({modalData: data.response});
    }).catch(() => {

    });
  }

  showModal() {
    this.setState({
      visible: true
    });
  }

  handleOk() {
    this.setState({
      visible: false
    });
  }

  handleCancel() {
    this.setState({
      visible: false
    });
    const list = this.state.modalData.filter(record => !record.uid);
    this.setState({modalData: list});
  }

  downloadFile(path, e) {
    e.preventDefault();
    const newPath = path ? path.split('path=')[1] : '';
    const encodePath = encodeURIComponent(newPath);
    remote({
      method: 'GET',
      url: `/borrower/getImageAbsolutePath?key=${encodePath}`
    }).then(res => {
      let a = $('<a></a>').attr('href', res).appendTo('body');
      a[0].click();
      a.remove();
    }, () => {
      msgBoxShow(_e('ajax_faild_msg'), 'faild', null, 3);
    }
    );
  }

  deleteFaildFile(record, e) {
    e.preventDefault();
    const fileList = this.state.modalData;
    const list = fileList.filter(data => data.uid !== record.uid);
    this.setState({modalData: list});
  }

  deleteFile(record, e) {
    e.preventDefault();
    const confirm = Modal.confirm;
    let self = this;
    confirm({
      title: '确定删除吗?',
      content: '',
      width: '250px',
      onOk() {
        remote({
          method: 'DELETE',
          url: '/borrower/deleteborrowerdocument?aId=' + loanInfoData.aId + '&loanId=' + loanInfoData.loanId + '&docId=' + record.docId + '&docFileId=' + record.docFileId + '&type=' + record.type + '&taskStatus=hold' + '&routingSystem=' + loanInfoData.routingSystem + '&appStatus=' + loanInfoData.loanStatus,
        }).then((data) => {
          const imgPath = data.response[0] ? data.response[0].path : '';
          const RelativePath = imgPath ? imgPath.split('path=')[1] : '';
          self.setState({
            modalData: data.response,
            visible: true,
            imgLength: data.response ? data.response.length : 0,
            imgPath: imgPath,
            fileType: data.response[0] ? data.response[0].fileName : ''
          });
          self.getOssPath(RelativePath);
        }).catch(() => {

        });
      },
      onCancel() {}
    });
  }

  reUpload(uid, e) {
    e.preventDefault();
    const list = this.state.modalData.filter(file => file.uid !== uid);
    const type = this.props.boxInfo.type;
    const file = this.state.faildList.filter(data => data.uid === uid)[0].file;
    const faildList = this.state.faildList.filter(data => data.uid !== uid);
    const req = new XMLHttpRequest();
    const action = loanInfoData.routingSystem === 'ICRC' ? '/borrower/uploadLoanappIcrcFile' : '/borrower/uploadloanimages';
    const name = '{aid:' + loanInfoData.aId + ',' + 'loanId:' + loanInfoData.loanId + '}?file_' + type + '_0';
    req.open('POST', action, true);
    req.setRequestHeader('Accept-Language', 'zh-CN,zh;q=0.8,en;q=0.6');
    req.setRequestHeader('accept', 'application/json;charset=utf-8, text/javascript, */*;');
    const formData = new FormData();
    formData.append(name, file);
    if(loanInfoData.routingSystem === 'ICRC') {
      formData.append('loanId', loanInfoData.loanId);
      formData.append('conditionId', this.props.boxInfo.docId);
      formData.append('status', 'hold');
      formData.append('appStatus', loanInfoData.loanStatus);
    }else {
      formData.append('aid', loanInfoData.aId);
    }
    req.onload = ((component) => {
      return function() {
        component.reqListener(this, uid, file.name);
      };
    })(this);
    req.send(formData);
    this.setState({faildList, modalData: list}, () => this.setTimer(file));
  }

  reqListener (http, uid, fileName) {
    const res = http.response;
    this.dealStatusDone(uid, fileName, res, http.status);
  }

  setTimer(file) {
    let prg = 0;
    const uid = file.uid;
    const fileName = file.name;
    const size = file.size;
    const list = this.state.modalData;
    const isUploading = list.filter(record => record.uid === uid).length;
    const objOfuploadFile = {uid: uid, fileName: fileName, status: 'uploading'};
    if(!isUploading) {
      list.push(objOfuploadFile);
      this.setState({modalData: list});
    }
    let space = Math.ceil(size / 33800);
    const timer = window.setInterval(()=>{
      if(prg >= 100) {
        window.clearInterval(timer);
      }else {
        if(prg < 90) {
          prg ++;
        }else if(prg === 90) {
          const random = Math.floor(Math.random() * 10);
          prg = 90 + random;
        }
        const progressArray = this.state.progressArray.filter( progress => progress.uid !== uid);
        const progressObj = {uid: uid, percent: prg};
        progressArray.push(progressObj);
        this.setState({progressArray});
      }
    }, space);
    const obj = {uid: uid, timer: timer, file: file};
    this.setState((preState) => ({timerArry: [...preState.timerArry, obj]}));
  }

  uploadCallback(data) {
    const file = data.file;
    const uid = file.uid;
    const fileName = file.name;
    const list = this.state.modalData;
    if (file.status === 'done') {
      this.dealStatusDone(uid, fileName, file.response, 200);
    }else if(file.status === 'error') {
      const newList = list.filter(record => record.uid !== uid);
      const objOfuploadFile = {uid: uid, fileName: fileName, status: 'error'};
      const timerObj = this.state.timerArry.filter(time => time.uid === uid)[0];
      const timer = timerObj.timer;
      const fileObj = timerObj.file;
      const faildFile = {uid: uid, file: fileObj};
      const timerArry = this.state.timerArry.filter(time => time.uid !== uid);
      const progressArray = this.state.progressArray.filter( progress => progress.uid !== uid);
      window.clearInterval(timer);
      newList.push(objOfuploadFile);
      this.setState({timerArry, progressArray, modalData: newList});
      this.setState((preState) =>({faildList: [...preState.faildList, faildFile]}));
    }
  }

  dealStatusDone(uid, fileName, res, status) {
    const list = this.state.modalData;
    let ret = res;
    if(typeof(ret) === 'string' && status === 200) {
      try {
        ret = JSON.parse(ret);
      } catch(e) {
        ret = ret;
      }
    }
    const timerObj = this.state.timerArry.filter(time => time.uid === uid)[0];
    const timer = timerObj.timer;
    const fileObj = timerObj.file;
    const timerArry = this.state.timerArry.filter(time => time.uid !== uid);
    const progressArray = this.state.progressArray.filter( progress => progress.uid !== uid);
    window.clearInterval(timer);
    this.setState({timerArry});
    this.setState({progressArray});
    if(status !== 200) {
      const newList = list.filter(record => record.uid !== uid);
      const objOfuploadFile = {uid: uid, fileName: fileName, status: 'error'};
      const faildFile = {uid: uid, file: fileObj};
      newList.push(objOfuploadFile);
      this.setState((preState) => ({modalData: newList, faildList: [...preState.faildList, faildFile]}));
    }else {
      const newList = list.filter(record => record.uid !== uid);
      // uploding and error file list
      const otherList = newList.filter(record => !!record.uid);
      const returnList = ret.response;
      const resultList = returnList.concat(otherList);
      const imgPath =  returnList[0] ? returnList[0].path : '';
      const RelativePath = imgPath ? imgPath.split('path=')[1] : '';
      this.setState({
        modalData: resultList,
        imgLength: returnList ? returnList.length : 0,
        imgPath: imgPath,
        fileType: returnList[0] ? returnList[0].fileName : ''
      });
      this.getOssPath(RelativePath);
    }
  }

  getClumns() {
    const downloadMethod = loanInfoData.ossDownloadMethod;
    const columns = [{
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
    }, {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      render: (text, record) => {
        const progress = this.state.progressArray.filter(data => data.uid === record.uid)[0];
        const pro = progress && progress.percent;
        return (
          <span>
            {record.status === 'uploading' &&
            <span>
              {pro}%<Line percent={pro} strokeWidth="8" strokeColor="#00BC8D" trailWidth="7" trailColor="#f7f7f7"/>
            </span>}
            {record.status === 'error' && <span style={{color: 'red'}}>上传失败</span>}
            {!record.status && <span>已上传</span>}
          </span>);
      }
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <span>
          {!record.uid &&
            <span>
              {downloadMethod === 'FRONTEND' ?
                  <a className="btn btn-default-b" onClick={e => this.downloadFile(record.path, e)}>下载</a>
                  : <a className="btn btn-default-b" href={record.path}>下载</a>

              }
                {record.readonly ? null :
                  <a className="btn btn-default-b" onClick={(e) => this.deleteFile(record, e)}>删除</a>}
            </span>}
          {record.status === 'error' &&
            <span>
              <a className="btn btn-default-b" onClick={(e) => this.deleteFaildFile(record, e)} >取消</a>
              <a className="btn btn-default-b" onClick={(e) => this.reUpload(record.uid, e)} >重新上传</a>
            </span>}
        </span>
      )
    }];
    return columns;
  }

  //  图片预览
  bindViewImg() {
    // const self = this;
    const $imgItem = $('.imgItem-search');
    const $box = $imgItem.find('.papers-box');
    remote({
      method: 'GET',
      url: '/borrower/getallloanimageforauditbytype?aid=' + loanInfoData.aId + '&loanAppId=' + loanInfoData.loanId + '&type=' + this.props.boxInfo.type + '&taskStatus=hold' + '&routingSystem=' + loanInfoData.routingSystem + '&conditionId=' + this.props.boxInfo.docId + '&appStatus=' + loanInfoData.loanStatus,
    }).then((data) => {
      const imgArray = data.response;
      if (imgArray && imgArray.length) {
        let $imgbox = null;
        let $images = $('#imgsGroup');
        if ($images.length) {
          $images.html('');
          $imgbox = $images;
        } else {
          $imgbox = $('<div/>').addClass('hide').attr('id', 'imgsGroup');
        }
        let imgs = imgArray;
        let counter = imgs.length;
        // imgs.reverse();
        $.each(imgs, (idx, img) => {
          const dealImgTypeArr = img.fileName && img.fileName.split('.');
          const type  = dealImgTypeArr && dealImgTypeArr[dealImgTypeArr.length - 1];
          const isImg = ['jpg', 'jpeg', 'png', 'gif'].indexOf(type) > -1 || false;
          const notImgShowPath = isImg || imgTypeDivision(type);
          const imgPath = img.path ? img.path.split('path=')[1] : '';
          if(loanInfoData.ossDownloadMethod === 'FRONTEND') {
            const encodePath = encodeURIComponent(imgPath);
            remote({
              method: 'GET',
              url: `/borrower/getImageAbsolutePath?key=${encodePath}`
            }).then((res) => {
              if(isImg) {
                $imgbox.append($('<img/>').attr('src', res));
              }else {
                $imgbox.append($('<img/>').attr('src', notImgShowPath));
              }
              counter --;
              if(counter === 0) {
                if (!$images.length) {
                  $('body').append($imgbox);
                }
                const viewer = $('#imgsGroup').viewer({
                  hidden: () => {
                    viewer.viewer('destroy');
                  },
                  fullscreen: false
                });
                $('#imgsGroup img:eq(0)').trigger('click');
              }
            });
          }else {
            if(isImg) {
              $imgbox.append( $('<img/>').attr('src', `/borrower/loanshowimage?path=${img.path.split('path=')[1]}`) );
            }else {
              $imgbox.append( $('<img/>').attr('src', notImgShowPath) );
            }
            counter--;
            if(counter === 0) {
              if (!$images.length) {
                $('body').append($imgbox);
              }
              const viewer = $('#imgsGroup').viewer({
                hidden: () => {
                  viewer.viewer('destroy');
                },
                fullscreen: false
              });
              $('#imgsGroup img:eq(0)').trigger('click');
            }
          }
        });
      }
    });
  }

  render() {
    const imgLength = this.state.imgLength;
    const name = this.state.name;
    const imgPath = this.state.imgPath;
    const type = this.props.boxInfo.type;
    const columns = this.getClumns();
    const fileGroup = this.props.fileGroup;
    const fileType = this.state.fileType ? this.state.fileType : '';
    const output = imgLength > 0 ? fileConcept(fileType, imgPath) : null;
    const action = loanInfoData.routingSystem === 'ICRC' ? '/borrower/uploadLoanappIcrcFile' : '/borrower/uploadloanimages';
    const data = loanInfoData.routingSystem === 'ICRC' ? {'loanId': loanInfoData.loanId, 'conditionId': this.props.boxInfo.docId, 'status': 'hold', 'appStatus': loanInfoData.loanStatus} : {'aid': loanInfoData.aId};
    const requiredClass = this.state.required === false ? 'cell-label file-box' : 'required cell-label file-box';
    return(
      <div className="col-cell-group row">
        <div className="col-cell col-xs-12 imgItem-search">
          {imgLength <= 0 ?
            <div>
              <p>
                <label className={requiredClass}>{name}(0/0)</label>
                <a className="papers-box-link file-box" onClick={(e) => this.getFileList(e)}>查看全部</a>
              </p>
              <div className="fl">
                <div className="papers-box">
                  <i className="icon-borrow icon-borrow-error"></i>
                  <div className="alert">未上传</div>
                </div>
              </div>
            </div>
              :
                <div>
                  <p>
                    <label className={requiredClass}>{name}(1/{imgLength}) </label>
                    <a className="papers-box-link file-box" onClick={(e) => this.getFileList(e)}>查看全部</a>
                  </p>
                  <div className="fl item">
                    <div className="papers-box no-border" onClick={this.bindViewImg.bind(this)}>
                      {output}
                    </div>
                  </div>
                </div>
          }
        </div>
        <Modal title={name} visible={this.state.visible}
               onOk={this.handleOk.bind(this)}
               onCancel={this.handleCancel.bind(this)}
               width={600} footer={null}>
          <div className="col-cell-group img-list-box">
            <Table columns={columns} dataSource={this.state.modalData} pagination={false} />
          </div>
          <div className="t-center ">
            {fileGroup !== 'FILL_SUBMIT' ?
              loanInfoData.detailType === 'AUTOFLLOWUP' &&
                <label className="label label-warning">补件状态中处理结果选择“补件”，才可以做补件操作</label>
              :
                <FileUpload rules={['jpg', 'jpeg', 'png', 'gif', 'pdf', 'zip', 'rar', 'doc',
                  'docx', 'xlsx', 'xls']}
                            typePrompt="jpg, jpeg, png, gif, pdf, zip, rar, word, excel"
                            name={'{aid:' + loanInfoData.aId + ',' + 'loanId:' + loanInfoData.loanId + '}?file_' + type + '_0'}
                            action= {action}
                            data={data}
                            onChange={this.uploadCallback.bind(this)}
                            setTimer={this.setTimer.bind(this)}
                            headers={{'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6', 'accept': 'application/json;charset=utf-8, text/javascript, */*;'}}/>
            }
          </div>
        </Modal>
      </div>
    );
  }
}
export default SupplymentDisplayBox;
