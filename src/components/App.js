import React, {Component} from 'react';
import {Tabs, Button, Modal, Input} from 'antd';
import DynamicForm from './dynamic_form/dynamic-form';
import SupplymentDisplayBox from './supplyment_display_box/supplyment-display-box';
import SignDisplayBox from './sign_display_box/sign-display-box';
import PreAuthorizeTab from './pre_authorize_tab/pre-authorize-tab';
import RepayInfoTab from './repay_info_tab/repay-info-tab';
import IssueCard from './issue_card/issue_card';
import DeductCard from './deduct_card/deduct_card';
import { remote } from './../utils/fetch';
import loanInfoData from '../constants/loan-info-data';
export default class App extends Component {

  constructor() {
    super();
    this.state = {
      forms: [],
      formValue: {},
      supplyList: [],
      signInfo: {},
      fileInfo: {},
      activeKey: '0',
      fileGroup: '',
      supplymentComment: '',
      signComment: '',
      conditionValues: {},
      cascadeConfig: [],
      visible: false,
      reloanInfo: {},
      showIssueCard: false,
      type: null,
    };
  }

  getChildContext() {
    return {
      conditionValues: this.state.conditionValues,
      cascadeConfig: this.state.cascadeConfig,
      reloanInfo: this.state.reloanInfo,
      product: this.state.product,
      originalLoanAppId: this.state.originalLoanAppId,
      setConditionValues: (name, val)=> {
        const formValues = this.state.conditionValues;
        formValues[name] = val;
        this.setState({conditionValues: formValues});
      }
    };
  }

  componentWillMount() {
    //  1.获取配置信息
    const isPreAuthorize = loanInfoData.isPreAuthorize === 'true';
    const patt = /RELOAN/;
    const isReloan = patt.test(loanInfoData.loanType);
    if(isPreAuthorize) {
      remote({
        method: 'GET',
        url: '/borrower/findReloanCredit?aid=' + loanInfoData.aId
        // url: '/findReloanCredit?aid=11660266'
      }).then((data) => {
        this.setState({reloanInfo: data, product: data.product, originalLoanAppId: data.originalLoanAppId});
        this.getConfigInfo(data.product);
      }).catch(() => {

      });
    }else {
      if(isReloan) {
        remote({
          method: 'GET',
          url: '/borrower/findReloanCredit?aid=' + loanInfoData.aId
        }).then((data) => {
          this.setState({reloanInfo: data});
        }).catch(() => {

        });
      }
      this.getConfigInfo();
    }

    //  2.获取表单数据
    if(!isPreAuthorize) {
      remote({
        method: 'GET',
        url: '/borrower/loadFormInfo?aid=' + loanInfoData.aId + '&appId=' + loanInfoData.loanId + '&configCode=' + loanInfoData.code
      }).then((ret) => {
        const conditionValues = {};
        if (ret.code === 20000) {
          const values = ret.data;
          Object.keys(values).forEach(key => {
            // 多表单数据不保存
            if (!Array.isArray(values[key])) {
              Object.keys(values[key]).forEach(fieldName => {
                // 如果subform为多表单数据不保存
                if (!Array.isArray(values[key][fieldName])) {
                  if (values[key][fieldName] !== null
                    && typeof (values[key][fieldName]) === 'object'
                    && !(values[key][fieldName].hasOwnProperty('province'))) {
                    const singleSubFormValue = values[key][fieldName];
                    Object.keys(singleSubFormValue).forEach(p => {
                      conditionValues[p] = singleSubFormValue[p];
                    });
                  } else {
                    conditionValues[fieldName] = values[key][fieldName];
                  }
                }
              });
            }
          });
          this.setState({formValue: ret.data, conditionValues});
        } else {
          msgBoxShow(ret.message, 'faild', null, 3);
        }
      }).catch(() => {

      });
    }

    // 3.获取补件信息数据
    if(loanInfoData.detailType !== 'LOANAPPGUIDE') {
      remote({
        method: 'GET',
        url: '/borrower/getloanholdinfo?aId=' + loanInfoData.aId + '&loanId=' + loanInfoData.loanId + '&taskStatus=hold' + '&routingSystem=' + loanInfoData.routingSystem
      }).then((data) => {
        this.setState({supplyList: data.allList || []});
      }).catch(() => {

      });
    }

    //  4.获取签约信息数据
    if(loanInfoData.detailType === 'SIGN' && loanInfoData.loanType !== 'SPEED_LOAN') {
      remote({
        method: 'GET',
        url: '/borrower/loansigninfo?aid=' + loanInfoData.aId + '&loanAppId=' + loanInfoData.loanId + '&count=1' + '&taskStatus=' + loanInfoData.taskStatus + '&routingSystem=' + loanInfoData.routingSystem
      }).then((data) => {
        this.setState({signInfo: data || {} });
      }).catch(() => {

      });
    }

    //  5.获取文件信息数据
    if(!isPreAuthorize) {
      remote({
        method: 'GET',
        url: '/borrower/loadProfileList?loanAppId=' + loanInfoData.loanId + '&aid=' + loanInfoData.aId
      }).then((data) => {
        if (data.code === 20000) {
          this.setState({fileInfo: data});
        } else {
          msgBoxShow(data.message, 'faild', null, 3);
        }
      }).catch(() => {

      });
    }
    let self = this;
    const fileGroup = document.getElementById('operationResult') ? document.getElementById('operationResult').value : '';
    self.setState({fileGroup});
    if(document.getElementById('btnsDealReview')) {
      document.getElementById('btnsDealReview').onclick = () => {
        const fileGroup1 = document.getElementById('operationResult') ? document.getElementById('operationResult').value : '';
        self.setState({fileGroup: fileGroup1});
        if(fileGroup1 === 'FILL_SUBMIT') {
          const activeKey = (isReloan || isPreAuthorize) ? '1' : '0';
          self.refs.tooltip.className = 'tooltip fade top in';
          self.setState({activeKey});
          setTimeout(() => {
            self.refs.tooltip.className = 'tooltip fade top';
          }, 3000);
        }else if(fileGroup1 === 'CUSTOMER_APPROVAL') {
          self.refs.signtooltip.className = 'tooltip fade top in';
          const activeKey = ((isReloan || isPreAuthorize) ? self.state.forms.length + 2 : self.state.forms.length + 1) + '';
          self.setState({activeKey});
          setTimeout(() => {
            self.refs.signtooltip.className = 'tooltip fade top';
          }, 3000);
        }
      };
    }
  }

  getConfigInfo(productCode) {
    const isPreAuthorize = loanInfoData.isPreAuthorize === 'true';
    const url = isPreAuthorize ? '/borrower/loadpreauthorizeloanform?productCode=' + productCode : '/borrower/loadProductConfig?productCode=' + loanInfoData.configProductCode + '&appId=' + loanInfoData.loanId + '&configCode=' + loanInfoData.code;
    // const url = isPreAuthorize ? '/loadpreauthorizeloanform?productCode=PAYROLL_RELOAN' : '/loadProductConfig?productCode=' + loanInfoData.configProductCode + '&appId=' + loanInfoData.loanId + '&configCode=' + loanInfoData.code;
    remote({
      method: 'GET',
      url: url
    }).then((ret) => {
      if(ret.code === 20000) {
        const cascadeConfig = [];
        ret.data.forms.forEach(form => {
          const fields = form.fields || [];
          const configObj = {};
          fields.forEach(field => {
            if(field.constraintRule) {
              configObj.constraintName = field.name;
              configObj.dependentFields = field.constraintRule.dependentFields;
              cascadeConfig.push(configObj);
            }
          });
        });
        this.setState({forms: ret.data.forms, cascadeConfig});
      }else {
        msgBoxShow(ret.message, 'faild', null, 3);
      }
    }).catch(() => {

    });
  }

  callback(activeKey) {
    this.setState({activeKey});
  }

  editFileSubmit() {
    const comment = $('#supplymentComment').val();
    const $dataForm = $('#btnsDealReview').closest('form');
    const dataForm = $dataForm.formParams(false);
    const data = $.extend(dataForm, {comment: comment});
    const $selfForm = $('#supplymentForm');
    $selfForm.ajaxBind({
      data: data,
      type: 'post',
      url: $dataForm.attr('action')
    }, {
      type: 'auto',
      onSuccess: () => {
        window.location.href = refreshUrl();
      }});
  }

  signFileSubmit() {
    if($('#signVideo').length) {
      const valFirst = $('#videoPara').val();
      const valSecond = $('#signVideo').val();
      const varAll = valFirst + ';/' + valSecond;
      $('#videoParameters').val(varAll);
    }
    const dataForm = $('#signForm').formParams(false);
    const comment = $('#signComment').val();
    const otherForm = $('#btnsDealReview').closest('form').formParams(false);
    const dataAll = $.extend(dataForm, otherForm, {comment: comment});
    const otherData = {
      aid: dataAll.actorId
    };
    const $form = $('#signForm');
    if($('#tenant').text() == 'DLXD' ) {
      $form.ajaxBind({
        data: dataAll,
        type: 'post',
        url: $('#btnsDealReview').closest('form').attr('action')
      }, {
        type: 'auto',
        onSuccess: () => {
          window.location.href = refreshUrl();
        }});
    }else {
      $form.ajaxBind({
        type: 'get',
        url: '/borrower/validateBankCardBinding?aid=' + otherData.aid
      }, {
        type: 'auto',
        successMsg: null,
        onSuccess: (data) => {
          if(!data.status) {
            msgBoxShow(data.message, 'faild', null, 3);
          }else {
            $form.ajaxBind({
              data: dataAll,
              type: 'post',
              url: $('#btnsDealReview').closest('form').attr('action')
            }, {
              type: 'auto',
              onSuccess: () => {
                window.location.href = refreshUrl();
              }});
          }
        }
      });
    }
  }

  popSupplyForm() {
    this.showModal();
  }

  bindIssueCard() {
    const productCode = loanInfoData.configProductCode;
    const showIssueCard = ['DOUBLE_FUND', 'PROPERTY_OWNER', 'LIFE_INSURANCE', 'OUTSTANDING', 'HIGH_SALARY', 'CAR_OWNER', 'MCA_GREENLANE_OFFLINE'].includes(productCode);
    const showOtherIssueCard = ['MCA', 'MCA_SIMPLIFIED'].includes(productCode);
    this.setState({ showIssueCard: showIssueCard || showOtherIssueCard, type: showOtherIssueCard ? 'other' : null });
  }

  coloseIssueModal() {
    this.setState({ showIssueCard: false });
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
  }

  render() {
    let {children} = this.props;
    const TabPane = Tabs.TabPane;
    const detailType = loanInfoData.detailType;
    const supplymentList = this.state.supplyList || [];
    const signInfo = this.state.signInfo || {};
    const signAllList = signInfo.allList || [];
    const patt = /RELOAN/;
    const isReloan = patt.test(loanInfoData.loanType);
    const isPreAuthorize = loanInfoData.isPreAuthorize === 'true';
    const isIcrcControl = loanInfoData.routingSystem === 'ICRC';
    return (
      <div className="root">
        {children}
        <Tabs defaultActiveKey="0" activeKey={this.state.activeKey} onChange={this.callback.bind(this)}>
          {(isReloan || isPreAuthorize) && <TabPane tab="预授信信息" key="0"><PreAuthorizeTab/></TabPane>}
          {(detailType === 'AUTOFLLOWUP' || detailType === 'SIGN') &&
            <TabPane
              tab={<div>
                   补件信息
                   <div className="tooltip fade top" ref="tooltip" style={{top: '-2px', left: '10px'}}>
                     <div className="tooltip-arrow" style={{left: '50%'}}>{null}</div>
                     <div className="tooltip-inner">在这里补件</div>
                   </div>
                 </div>
              } key={(isReloan || isPreAuthorize) ? 1 : 0} >
              {supplymentList && supplymentList.length > 0 ?
                supplymentList.map((val, idx)=>{
                  return <SupplymentDisplayBox boxInfo={val} key={idx} fileGroup={this.state.fileGroup} supplyList={this.state.supplyList}/>;
                })
                :
                  <div className="col-cell col-xs-6">
                    <div className="papers-box">
                      <i className="icon-borrow icon-borrow-error">{null}</i>
                      <div className="alert">无需补件</div>
                    </div>
                  </div>
              }
              <div id="editFilesGroup"
                className={(this.state.fileGroup !== 'FILL_SUBMIT' || loanInfoData.loanStatus !== 'HOLD') && 'hide'}
                style={{clear: 'both'}}>
                <form id="supplymentForm">
                  <div className="col-cell-group col-cell">
                    <p className="cell-label">备注</p>
                    <textarea name="comment"
                              onChange={e=>this.setState({supplymentComment: e.target.value})}
                              id="supplymentComment"></textarea>
                  </div>
                  <div className="task-inner-box-content">
                    <button type="button"
                            id="editFileSubmit" className="btn btn-default btn-h-lg"
                            onClick={this.editFileSubmit.bind(this)}>补件上传</button>
                  </div>
                </form>
              </div>
            </TabPane>}
          {this.state.forms.map((val, idx)=>{
            return (
              <TabPane tab={val.label}
                       key={detailType === 'AUTOFLLOWUP' || detailType === 'SIGN' ? ((isReloan || isPreAuthorize) ? idx + 2 : idx + 1) : ((isReloan || isPreAuthorize) ? idx + 1 : idx)}>
                <DynamicForm key={idx} formInfo={val} detailType={detailType} fileInfo={this.state.fileInfo}
                           formValue={this.state.formValue && this.state.formValue[val.name]}
                           distUrl={'/borrower/createpreauthorizeloan?actorId=' + loanInfoData.aId + '&loanType=' + this.state.product + '&originalLoanAppId=' + this.state.originalLoanAppId }/>
              </TabPane>);
          })}
          {detailType === 'SIGN' && loanInfoData.loanType !== 'SPEED_LOAN' &&
            <TabPane
              tab={<div>签约资料
                     <div className="tooltip fade top" ref="signtooltip" style={{top: '-2px', left: '10px'}}>
                       <div className="tooltip-arrow" style={{left: '50%'}}>{null}</div>
                       <div className="tooltip-inner">在这里签约</div>
                     </div>
                   </div>}
              key={(isReloan || isPreAuthorize) ? this.state.forms.length + 2 : this.state.forms.length + 1}>
              {
                isIcrcControl &&
                  <Tabs className="sign-tab">
                    <TabPane tab="后台签约资料" key="1">
                      <div className="guarant-group">
                        {signInfo && signInfo.guarantorInfo && signInfo.guarantorInfo.length > 0 &&
                          signInfo.guarantorInfo.map((guarantor, idx) =>
                            <div key={idx}>
                              <span className="sign-label">{guarantor.name}</span>
                              <a className="btn active"
                                  href={'/borrower/signPdfFile?type=' + guarantor.type + '&id=' + guarantor.id + '&routingSystem=' + loanInfoData.routingSystem}
                                  target="_blank"
                                  key={guarantor.id + '_' + idx}>
                              查看
                              </a>
                            </div>)
                        }
                      </div>
                      {
                        signAllList.length > 0 ?
                          signAllList.map((val, idx)=>{
                            if(val.type === 'DEDUCT_CARD') { // 绑定代扣卡
                              return (
                                <div  key={idx} style={{ marginBottom: '15px', clear: 'both' }}>
                                  <span className={`${val.required ? 'sign-required' : ''} sign-label`}>{val.name} {`${val.completed ? '(已完成)' : '(未完成)'}`}</span>
                                  {
                                    this.state.fileGroup === 'CUSTOMER_APPROVAL' && loanInfoData.loanStatus === 'APPROVED' &&
                                      <a onClick={this.popSupplyForm.bind(this)}>去绑定</a>
                                  }
                                  <Modal
                                    title={val.name}
                                    visible={this.state.visible}
                                    onOk={this.handleOk.bind(this)}
                                    onCancel={this.handleCancel.bind(this)}
                                    width={600}
                                    footer={null}
                                  >
                                    <DeductCard cardValue={val.conditionContent || {}} loanId={loanInfoData.loanId} docId={val.docId} />
                                  </Modal>
                                </div>
                              );
                            }
                            if (val.type === 'ISSUE_CARD') { // 绑定放款卡
                              return (
                                <div key={idx} style={{ marginBottom: '15px', clear: 'both' }}>
                                  <span className={`${val.required ? 'sign-required' : ''} sign-label`}>{val.name} {`${val.completed ? '(已完成)' : '(未完成)'}`}</span>
                                  {
                                    this.state.fileGroup === 'CUSTOMER_APPROVAL' && loanInfoData.loanStatus === 'APPROVED' &&
                                      <a onClick={this.bindIssueCard.bind(this)}>去绑定</a>
                                  }
                                  <Modal
                                    title={val.name}
                                    visible={this.state.showIssueCard}
                                    onCancel={this.coloseIssueModal.bind(this)}
                                    width={600}
                                    footer={null}
                                  >
                                    <IssueCard cardValue={val.conditionContent || {}} type={this.state.type} loanId={loanInfoData.loanId} docId={val.docId} />
                                  </Modal>
                                </div>
                              );
                            }
                            if (val.type === 'DOCUMENT') {
                              return <SignDisplayBox boxInfo={val} key={idx} fileGroup={this.state.fileGroup} signInfo={this.state.signInfo}/>;
                            }
                            return null;
                          })
                        :
                        <div className="col-cell col-xs-6">
                          <div className="papers-box">
                            <i className="icon-borrow icon-borrow-error">{null}</i>
                            <div className="alert">无需补件</div>
                          </div>
                        </div>
                      }
                    </TabPane>
                    <TabPane tab="移动端签约资料" key="2">
                      {
                        signAllList.map((val, idx)=>{
                          if (val.type === 'LITE') {
                            return <SignDisplayBox boxInfo={val} key={idx} fileGroup={this.state.fileGroup} signInfo={this.state.signInfo}/>;
                          }
                          if (val.type === 'LITE_SIGN') {
                            return <div key={idx}><span className={`${val.required ? 'sign-required' : ''} sign-label`}> {`${val.name}: ${val.completed ? '已上传' : '未完成'}`}</span></div>;
                          }
                          return null;
                        })
                      }
                    </TabPane>
                  </Tabs>
              }
              {
                !isIcrcControl &&
                  <div className="guarant-group">
                    {signInfo && signInfo.guarantorInfo && signInfo.guarantorInfo.length > 0 &&
                      signInfo.guarantorInfo.map((guarantor, idx) =>
                        <div key={idx}>
                          {guarantor.name}
                          <a className="btn active"
                              href={'/borrower/signPdfFile?type=' + guarantor.type + '&id=' + guarantor.id + '&routingSystem=' + loanInfoData.routingSystem}
                              target="_blank"
                              key={guarantor.id + '_' + idx}>
                          查看
                          </a>
                        </div>)
                    }
                    {
                      signAllList.length > 0 ?
                        signAllList.map((val, idx)=>{
                          return <SignDisplayBox boxInfo={val} key={idx} fileGroup={this.state.fileGroup} signInfo={this.state.signInfo}/>;
                        })
                      :
                      <div className="col-cell col-xs-6">
                        <div className="papers-box">
                          <i className="icon-borrow icon-borrow-error">{null}</i>
                          <div className="alert">无需补件</div>
                        </div>
                      </div>
                    }
                  </div>
              }
              <div id="contractFilesGroup"
                   className={(this.state.fileGroup !== 'CUSTOMER_APPROVAL' || loanInfoData.loanStatus !== 'APPROVED') && 'hide'}
                   style={{clear: 'both'}}>
                <form style={{ marginLeft: '20px' }}>
                  <div className="col-cell-group col-cell">
                    <p className="cell-label">备注</p>
                    <textarea name="comment"
                    onChange={e=>this.setState({signComment: e.target.value})}
                    id="signComment"></textarea>
                  </div>
                  <div className="task-inner-box-content">
                    <button type="button"
                            id="contractFileSubmit" className="btn btn-default btn-h-lg"
                            onClick={this.signFileSubmit.bind(this)}>客户确认</button>
                  </div>
                </form>
              </div>
            </TabPane>
          }
          {detailType === 'SIGN' && 
            <TabPane tab="还款信息" key={(isReloan || isPreAuthorize) ? this.state.forms.length + 3 : this.state.forms.length + 2}>
              <RepayInfoTab />
            </TabPane>
          }
        </Tabs>
      </div>
    );
  }
}

App.childContextTypes = {
  conditionValues: React.PropTypes.object,
  reloanInfo: React.PropTypes.object,
  product: React.PropTypes.string,
  originalLoanAppId: React.PropTypes.string,
  cascadeConfig: React.PropTypes.array,
  setConditionValues: React.PropTypes.func
};
