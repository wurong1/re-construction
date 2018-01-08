import React, {Component} from 'react';
import {Input, Select, Modal, Row, Col, Table} from 'antd';
import moment from 'moment';
import FileDisplayBox from '../file_display_box/file-display-box';
import loanInfoData from '../../constants/loan-info-data';
import { remote } from '../../utils/fetch';

class FormFieldReadonly extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channelOptions: [],
      caVisible: false,
      mcVisible: false,
      caData: null,
      mcData: null
    };
    const referCode = props.referCode;
    if (referCode) {
      this.getChannelOptions(referCode);
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.referCode !== nextProps.referCode) {
      this.getChannelOptions(nextProps.referCode);
    }
  }

  getChannelOptions(referCode) {
    const isChannel = this.props.val.inputType === 'CHANNEL';
    if(isChannel) {
      remote({
        method: 'GET',
        url:`/borrower/loadSalesChannelByRefererCode?refererCode=${referCode}`,
      }).then((data) => {
        this.setState({channelOptions: data});
      }).catch((e) => {
        msgBoxShow(e.response && e.response.data && e.response.data.errorData && e.response.data.errorData.message, 'faild', null);
      });
    }
  }

  getCreditAgencyInfo(e) {
    e.preventDefault();
    const ssn = this.context.conditionValues ? this.context.conditionValues.user_cardNum : null;
    const name = this.context.conditionValues ? this.context.conditionValues.user_realName : null;
    const caData = this.state.caData;
    if(!caData) {
      remote({
        method: 'GET',
        url: '/borrower/getcreditreportfrombank?name=' + name + '&ssn=' + ssn + '&userId=' + ssn
      }).then((data) => {
        let result = {};
        try {
          result = JSON.parse(data.responseText);
        } catch (err) {
          msgBoxShow('数据格式有误！', 'faild', null);
          return;
        }
        this.setState({caVisible: true, caData: result});
      }).catch(() => {

      });
    }else {
      this.setState({caVisible: true});
    }
  }

  getMobileCarrierInfo(e) {
    e.preventDefault();
    const ssn = this.context.conditionValues ? this.context.conditionValues.user_cardNum : null;
    const mcData = this.state.mcData;
    if(!mcData) {
      remote({
        method: 'GET',
        url: '/borrower/getcreditreportfromoperator?phone=' + loanInfoData.userPhone + '&ssn=' + ssn
      }).then((data) => {
        let result = {};
        let status = '';
        try {
          result = JSON.parse(data.responseText);
          status = result.status;
          if(status !== 'OK') {
            msgBoxShow(result.message, 'faild', null);
            return;
          }
        } catch (err) {
          msgBoxShow('数据格式有误！', 'faild', null);
          return;
        }
        this.setState({mcVisible: true, mcData: result});
      }).catch(() => {

      });
    }else {
      this.setState({mcVisible: true});
    }
  }

  render() {
    const val = this.props.val;
    const isAddress = val.inputType === 'ADDRESS';
    const isSelect = val.inputType === 'SELECT';
    const isChannel = val.inputType === 'CHANNEL';
    const isCheck = val.inputType === 'CHECK';
    const isDate = val.inputType === 'DATE';
    const isFile = val.inputType === 'DOCUMENT';
    const isMultiple = this.props.multiple ? true : false;
    const tempValue = this.props.tempValue;
    const isSubForm = this.props.isSubForm;
    const subFormName = this.props.subFormName;
    let applyName = val.name;
    const isCreditAgency = applyName === 'CREDIT_AGENCY' && this.props.label === 'success';
    const isMobileCarrier = applyName === 'MOBILE_CARRIER' && this.props.label === 'success';
    let fieldClass = (isSubForm && isMultiple) ? 'field-readonly-class' : '';
    let conditionValue;
    if(isSubForm) {
      applyName = subFormName + '_' + applyName;
    }
    if(isMultiple) {
      const idx = this.props.idx;
      applyName = applyName + '_' + idx;
    }
    let label = tempValue ? tempValue : this.props.label;
    const {getFieldDecorator, getFieldValue} = this.props.form;
    let str = '';
    if(isAddress) {
      if(label && label.city === label.province) {
        delete  label.city;
      }
      for(let pro in label) {
        if(label[pro]) {
          str += label[pro];
        }
      }
      label = str;
    }else if(isCheck) {
      if(label && label.length > 0) {
        let options = val.options.filter(opt => label.indexOf(opt.value) !== -1);
        if(options && options.length > 0) {
          options.forEach((data, idx)=>{
            if(idx < options.length - 1) {
              str += data.name + ' ,';
            }else {
              str += data.name;
            }
          });
        }
        label = str;
      }
    }else if(isDate && !!label) {
      label = moment(label).format('YYYY-MM-DD');
    }else if(isFile) {
      label = <FileDisplayBox fieldInfo={val} fileInfo={this.props.fileInfo}/>;
    }
    if(label === 0) {
      label = label.toString();
    }
    // 预授信推荐人CODE
    if(val.name === 'loan_referCode') {
      label = this.context.reloanInfo.loanReferCode;
    }
    let conditionShow = val.condition ? false : true;
    if (!conditionShow) {
      let conFieldName = val.condition.fieldName;
      const compareType = val.condition.comparison;
      const isCrossForm = !(this.props.formInfo && this.props.formInfo.fields.some(f => f.name === conFieldName));
      if(isSubForm) {
        conFieldName = subFormName + '_' + conFieldName;
      }
      if(isMultiple) {
        conFieldName = conFieldName + '_' + this.props.idx;
      }
      conditionValue = isCrossForm ? this.context.conditionValues[val.condition.fieldName] : getFieldValue(conFieldName);
      switch (compareType) {
        case 'EQ' :
          conditionShow =  conditionValue === val.condition.value; break;
        case 'IN' :
          conditionShow =  val.condition.value.split(',').some(val => val === conditionValue); break;
      }
    }
    if (!conditionShow) return (null);
    const caData = this.state.caData;
    const mcData = this.state.mcData;
    const caSummaryColumns = [{
      title: null,
      dataIndex: 'statement',
      key: 'statement',
      width: 359
    }, {
      title: '信用卡',
      dataIndex: 'creditAccountCount',
      key: 'creditAccountCount',
      width: 113
    }, {
      title: '住房贷款',
      dataIndex: 'mortgageAccountCount',
      key: 'mortgageAccountCount',
      width: 141
    }, {
      title: '其他贷款',
      dataIndex: 'otherAccountCount',
      key: 'otherAccountCount',
      width: 142
    }];
    const caRecordColumns = [{
      title: '查询日期',
      dataIndex: 'requestedDate',
      key: 'requestedDate',
      width: 131
    }, {
      title: '查询操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 342
    }, {
      title: '查询原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 283
    }];
    const caDetailColumns = [{
      title: '账户明细',
      dataIndex: 'creditRecord',
      key: 'creditRecord'
    }];
    const mcAppCheckColumns = [{
      title: '检查项',
      dataIndex: 'checkPoint',
      key: 'checkPoint',
      width: 326
    }, {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      width: 103
    }, {
      title: '依据',
      dataIndex: 'evidence',
      key: 'evidence',
      width: 328
    }];
    // const mcBevCheckColumns = [{
    //   title: '检查项',
    //   dataIndex: 'checkPoint',
    //   key: 'checkPoint',
    //   width: 316
    // }, {
    //   title: '结果',
    //   dataIndex: 'result',
    //   key: 'result',
    //   width: 113
    // }, {
    //   title: '依据',
    //   dataIndex: 'evidence',
    //   key: 'evidence',
    //   width: 328
    // }];
    const mcContactListColumns = [{
      title: '需求类型',
      dataIndex: 'needsType',
      key: 'needsType',
      width: 121
    }, {
      title: '归属地',
      dataIndex: 'phoneNumLoc',
      key: 'phoneNumLoc',
      width: 97
    }, {
      title: '联系次数',
      dataIndex: 'callCnt',
      key: 'callCnt',
      width: 140
    }, {
      title: '联系时间(分)',
      dataIndex: 'callLen',
      key: 'callLen',
      width: 151
    }, {
      title: '主叫次数',
      dataIndex: 'callOutCnt',
      key: 'callOutCnt',
      width: 112
    }, {
      title: '被叫次数',
      dataIndex: 'callInCnt',
      key: 'callInCnt',
      width: 122
    }];
    const mcContactRegionColumns = [{
      title: '地区',
      dataIndex: 'regionLoc',
      key: 'regionLoc',
      width: 67
    }, {
      title: '号码数量',
      dataIndex: 'regionUniqNumCnt',
      key: 'regionUniqNumCnt',
      width: 89
    }, {
      title: '电话呼入次数',
      dataIndex: 'regionCallInCnt',
      key: 'regionCallInCnt',
      width: 121
    }, {
      title: '电话呼入时间(分)',
      dataIndex: 'regionCallInTime',
      key: 'regionCallInTime',
      width: 173
    }, {
      title: '电话呼出次数',
      dataIndex: 'regionCallOutCnt',
      key: 'regionCallOutCnt',
      width: 122
    }, {
      title: '电话呼出时间(分)',
      dataIndex: 'regionCallOutTime',
      key: 'regionCallOutTime',
      width: 182
    }];
    const mcCollectionContactColumns = [{
      title: '联系人',
      dataIndex: 'contactName',
      key: 'contactName',
      width: 103
    }, {
      title: '最早联系时间',
      dataIndex: 'beginDate',
      key: 'beginDate',
      width: 163
    }, {
      title: '最晚联系时间',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 163
    }, {
      title: '联系电话',
      key: 'phoneNum',
      width: 128,
      render: (text, record) => (
          record.contactDetails && record.contactDetails[0] ? record.contactDetails[0].phoneNum : ''
      )
    }, {
      title: '近半年短信/通话次数和时长',
      key: 'smsCnt&callCnt&callLen',
      width: 200,
      render: (text, record) => (
          record.contactDetails && record.contactDetails[0] ? record.contactDetails[0].smsCnt + '/' + record.contactDetails[0].callCnt + '/' + record.contactDetails[0].callLen : ''
      )
    }];
    return (
      isFile ?
        <div className="document-group">
          {label}
        </div>
          :
            <div className="cell-group">
              <p>
                <label>{val.label}
                </label>
                {isCreditAgency &&
                  <span>
                    <a onClick={(e) => this.getCreditAgencyInfo(e)}>查看</a>
                    <Modal title="征信报告" visible={this.state.caVisible}
                            onOk={() => this.setState({caVisible: false})} onCancel={() => this.setState({caVisible: false})} width={800} footer={null}>
                      <div className="auth-content">
                        <div className="auth-pop-head">
                          <Row>
                            <Col span={6}><label className="auth-label-head">姓名: </label>{caData && caData.report && caData.report.creditRecords && caData.report.creditRecords[0] && caData.report.creditRecords[0].name}</Col>
                            <Col span={6}><label className="auth-label-head">证件类型: </label>{caData && caData.report && caData.report.creditRecords && caData.report.creditRecords[0] && caData.report.creditRecords[0].certificateType}</Col>
                            <Col span={6}><label className="auth-label-head">证件号: </label>{caData && caData.report && caData.report.creditRecords && caData.report.creditRecords[0] && caData.report.creditRecords[0].certificateNo}</Col>
                            <Col span={6}><label className="auth-label-head">婚姻状况: </label>{caData && caData.report && caData.report.creditRecords && caData.report.creditRecords[0] && caData.report.creditRecords[0].martialStatus}</Col>
                          </Row>
                        </div>
                        <div className="auth-pop-body">
                          <div className="auth-label">信息概要</div>
                          <Table dataSource={(caData && caData.report && caData.report.creditRecords && caData.report.creditRecords[0] && caData.report.creditRecords[0].summaries) || [] } columns={caSummaryColumns}  pagination={false} scroll={{ y: 410 }} />
                        </div>
                        <div className="auth-pop-body">
                          <div className="auth-label">账户明细</div>
                          <Table dataSource={(caData && caData.report && caData.report.creditRecords && caData.report.creditRecords[0] && caData.report.creditRecords[0].details) || [] } columns={caDetailColumns}  pagination={false} scroll={{ y: 410 }} />
                        </div>
                        <div className="auth-pop-body">
                          <div className="auth-label">机构查询记录明细</div>
                          <Table dataSource={(caData && caData.report && caData.report.creditRecords && caData.report.creditRecords[0] && caData.report.creditRecords[0].queryRecords) || [] } columns={caRecordColumns}  pagination={false} scroll={{ y: 410 }} />
                        </div>
                      </div>
                    </Modal>
                  </span>}
                {isMobileCarrier &&
                <span>
                  <a onClick = {(e) => this.getMobileCarrierInfo(e)}>查看</a>
                  <Modal title="运营商报告" visible={this.state.mcVisible}
                         onOk={() => this.setState({mcVisible: false})} onCancel={() => this.setState({mcVisible: false})} width={800} footer={null}>
                  <div className="auth-content">
                    <div className="auth-pop-head">
                      <Row>
                        <Col span={6}><label className="auth-label-head">编号: </label>{mcData && mcData.report && mcData.report.id}</Col>
                        <Col span={6}><label className="auth-label-head">电话: </label>{mcData && mcData.phone}</Col>
                      </Row>
                    </div>
                    <div className="auth-pop-body">
                      <div className="auth-label">申报信息核查</div>
                      <Table dataSource={(mcData && mcData.reportData && mcData.reportData.applicationCheck) || [] } columns={mcAppCheckColumns}  pagination={false} scroll={{ y: 410 }} />
                    </div>
                    <div className="auth-pop-body">
                      <div className="auth-label">联系人</div>
                      <Table dataSource={(mcData && mcData.reportData && mcData.reportData.collectionContact) || [] } columns={mcCollectionContactColumns}  pagination={false} scroll={{ y: 410 }} />
                    </div>
                    <div className="auth-pop-body">
                      <div className="auth-label">通话次数排名</div>
                      <Table dataSource={(mcData && mcData.reportData && mcData.reportData.contactList) || [] } columns={mcContactListColumns}  pagination={false} scroll={{ y: 410 }}  />
                    </div>
                    <div className="auth-pop-body">
                      <div className="auth-label">联系人地区排名</div>
                      <Table dataSource={(mcData && mcData.reportData && mcData.reportData.contactRegion) || [] } columns={mcContactRegionColumns}  pagination={false} scroll={{ y: 410 }} />
                    </div>
                  </div>
                  </Modal>
                </span>}
              </p>
                {isSelect &&
                  getFieldDecorator(applyName, {
                    initialValue: label
                  })(
                    <Select className={'readonly-select ' + fieldClass} disabled>
                      {val.options && val.options.filter((v)=>v.name).map((opt)=> {
                        return <Option key={opt && opt.value} value={opt && opt.value}>{opt.name}</Option>;
                      })}
                    </Select>
                  )}
                {isChannel &&
                  getFieldDecorator(applyName, {
                    initialValue: label && label.toString()
                  })(
                    <Select className="readonly-select" disabled>
                      {this.state.channelOptions && this.state.channelOptions.filter((v)=>v.projectId && v.projectName).map((opt)=> {
                        return <Option key={opt && opt.projectId} value={opt && opt.projectId && (opt.projectId).toString()}>{opt.projectName}</Option>;
                      })}
                    </Select>
                  )}
                {!isSelect && !isChannel &&
                  getFieldDecorator(applyName, {
                    initialValue: label
                  })(
                    <Input className={'readonly-input ' + fieldClass} type="text" disabled/>
                )}
            </div>
    );
  }
}
export default FormFieldReadonly ;

FormFieldReadonly.contextTypes = {
  conditionValues: React.PropTypes.object,
  reloanInfo: React.PropTypes.object
};
