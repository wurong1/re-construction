import { Button, Form} from 'antd';
import React, {Component} from 'react';
import FormField from '../form_field/form-field';
import FormFieldReadonly from '../form_field_readonly/form_field_readonly';
import { remote } from '../../utils/fetch';
// import { API, ACTIONS } from '../../constants';
import loanInfoData from '../../constants/loan-info-data';
import city from '../../constants/city';
import SubForm from '../sub_form/sub-form';
import moment from 'moment';
class DynamicForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contractData: [],
      arry: [],
      subFormArray: [],
      values: null,
      submitFlag: false,
      submitLoadingFlag: false,
      timestamp: 0,
      reloanBankInfo: {},
      enterpriseFlag: false,
      enterpriseData: [],
      enterpriseSearchData: [],
      bankOptions: []
    };
  }

  componentWillMount() {
    const patt = /RELOAN/;
    const isReloanBankTab = patt.test(loanInfoData.loanType) && this.props.formInfo.name === 'PERSONAL_RELOAN_bankAccount';
    const isMultiple = this.props.formInfo.multiple;
    if(isMultiple) {
      let contractData = this.props.formValue ? this.props.formValue : initContractData(this.props.formInfo.fields, this.props.formInfo.minCount);
      if(contractData.length < 1) {
        contractData = initContractData(this.props.formInfo.fields, this.props.formInfo.minCount);
      }
      this.setState({contractData});
    }
    const subFormArray = this.props.formInfo.fields.filter(field=>field.fieldType === 'FORM');
    this.setState({subFormArray});
    this.setState({values: this.props.formValue});
    if(isReloanBankTab) {
      remote({
        method: 'GET',
        url: '/borrower/findLoanBankCard?aid=' + loanInfoData.aId
      }).then((data) => {
        this.setState({reloanBankInfo: data});
      }).catch(() => {

      });
    }
  }

  handleProvinceChange(idx, province) {
    const { setFieldsValue, getFieldValue} = this.props.form;
    const isMultiple = this.props.formInfo.multiple;
    const cities = city.filter((item) => item.label === province)[0];
    const arry = this.state.arry;
    const cityName = this.props.formInfo.fields.filter(field => field.inputType === 'CITY');
    const name = cityName[0] ? cityName[0].name : null;
    let cityValue = null;
    let valueFlag = false;
    if(isMultiple) {
      cityValue = getFieldValue(name + '_' + idx);
      valueFlag = !!cities && cities.children.some(data=>data.value === cityValue);
      if(!valueFlag) {
        setFieldsValue({[name + '_' + idx]: null});
      }
      if(cities) {
        arry[idx] = cities.children || [];
        this.setState({arry});
      }else {
        arry[idx] = [];
        this.setState({arry});
      }
    }else {
      cityValue = getFieldValue(name);
      valueFlag = !!cities && cities.children.some(data=>data.value === cityValue);
      if(!valueFlag) {
        setFieldsValue({[name]: null});
      }
      if(cities) {
        this.setState({cities: cities.children || []});
      }else {
        this.setState({cities: []});
      }
    }
  }

  getChildChange(val, name) {
    if(val === 'CHINA_TOP_500' || val === 'PUBLIC_COMPANY' || val === 'WORLD_TOP_500') {
      remote({
        method: 'GET',
        url: '/borrower/findAllCompany?companyType=' + val
      }).then((data) => {
        this.setState({enterpriseData: data[val]});
      }).catch(() => {

      });
      this.setState({enterpriseFlag: true});
      this.setState({enterpriseSearchData: []});
    }else if(name === 'bank_type'){
      remote({
        method: 'GET',
        url: `/borrower/find-bank-by-type?actorId=${loanInfoData.aId}&bankAccountType=${val}`
      }).then((data) => {
        this.setState({bankOptions: data || []});
      }).catch((e) => {
        this.setState({bankOptions: []});
        msgBoxShow(e.response && e.response.data && e.response.data.errorData && e.response.data.errorData.message, 'faild', null);
      });
    }else {
      this.setState({enterpriseData: []});
      this.setState({enterpriseFlag: false});
      this.setState({enterpriseSearchData: []});
    }
  }

  reRenderData(val) {
    this.setState({enterpriseSearchData: val});
  }

  setValuesBySubForm(subFormVlaue) {
    this.setState((preState)=>({values: {...preState.values, ...subFormVlaue}}));
  }

  //  表单提交
  formSubmit() {
    const formId = this.props.formInfo.id;
    const isMultiple = this.props.formInfo.multiple;
    const dateArray = this.props.formInfo.fields.filter(data => data.inputType === 'DATE');
    const fields = this.props.formInfo.fields;
    let result;
    // const url=convertURL(this.props.formInfo.url,formName);
    this.props.form.validateFields((err, values) => {
      if(err) {
        msgBoxShow('您填写的信息有误！', 'faild', null);
        return;
      }
      const timestamp = Date.parse( new Date());
      const timestamp1 = this.state.timestamp;
      this.setState({timestamp: timestamp});
      this.setState({submitLoadingFlag: true});
      if(timestamp1) {
        const interval = timestamp - timestamp1;
        if(interval < 1500) return;
      }
      dealWithAddressData(values);
      dealWithKeyChangeData(values);
      if(isMultiple) {
        const multipleArry = [];
        for(let i = 0; i < this.state.contractData.length; i++) {
          const id = this.state.contractData[i].id;
          const objOfmultiple = dealWithDateData(values, i, id, fields, null, dateArray);
          multipleArry.push(objOfmultiple);
        }
        result = multipleArry;
      }else {
        const preValues = {...values};
        const obj = dealWithDateData(values, null, null, fields, null, dateArray);
        result = {...preValues, ...obj};
        this.state.subFormArray.forEach(form =>{
          const subFormName = form.name;
          const multipleSubArry = [];
          const isMultiple1 = form.multiple;
          const dateArray1 = form.fields.filter(data => data.inputType === 'DATE');
          if(isMultiple1) {
            for(let i = 0; i < form.count; i++) {
              const len = this.state.values[subFormName] ? this.state.values[subFormName].length : 0;
              let id;
              if(i < len) {
                id = this.state.values[subFormName][i].id;
              }else {
                if(len > 0) {
                  id = this.state.values[subFormName][len - 1].id + 1;
                }else {
                  id = 1;
                }
              }
              const objOfSubMulForm = dealWithDateData(result, i, id, form.fields, subFormName, dateArray1);
              multipleSubArry.push(objOfSubMulForm);
            }
            result[subFormName] = multipleSubArry;
          }else {
            const objOfSubForm = dealWithDateData(result, null, null, form.fields, subFormName, dateArray1);
            result[subFormName] = objOfSubForm;
          }
        });
      }
      remote({
        method: 'POST',
        url: '/borrower/commitProfile?aid=' + loanInfoData.aId + '&appId=' + loanInfoData.loanId + '&formCode=' + formId,
        data: result
      }).then((ret) => {
        if(ret.code === 20000) {
          remote({
            method: 'GET',
            url: '/borrower/loadFormInfo?aid=' + loanInfoData.aId + '&appId=' + loanInfoData.loanId + '&configCode=' + loanInfoData.code
          }).then((ret1) => {
            if(ret1.code === 20000) {
              this.setState({values: ret1.data[this.props.formInfo.name]});
              this.setState({contractData: ret1.data[this.props.formInfo.name]});
              this.setState((preState)=>({submitFlag: (!preState.submitFlag)}));
              this.setState({submitLoadingFlag: false});
              msgBoxShow(_e('ajax_success_msg'), 'success', null, 3);
            }else {
              this.setState({submitLoadingFlag: false});
              msgBoxShow(ret1.message, 'faild', null, 3);
            }
          }).catch(() => {
            this.setState({submitLoadingFlag: false});
          });
        } else {
          this.setState({submitLoadingFlag: false});
          msgBoxShow(ret.message, 'faild');
        }
      }).catch(() => {
        this.setState({submitLoadingFlag: false});
      });
    });
  }

  commonFormSubmit() {
    const isPreAuthorize = loanInfoData.isPreAuthorize === 'true';
    this.props.form.validateFields((err, values) => {
      if (err) {
        msgBoxShow('您填写的信息有误！', 'faild', null);
        return;
      }
      this.setState({submitLoadingFlag: true});
      let data = {};
      if(!isPreAuthorize) {
        Object.keys(values).forEach(key => {
          const props = key.split('_')[0];
          data[props] = values[key];
        });
      }else {
        data = values;
      }
      remote({
        method: 'post',
        hideError: true,
        url: this.props.distUrl,
        data: data
      }).then(() => {
        msgBoxShow(_e('ajax_success_msg'), 'success', null, 3);
        if(isPreAuthorize) {
          const taskId = getQueryString('taskId');
          window.location = '/borrower/dealloanappguidedtask?taskId=' + taskId;
        }
        this.setState({submitLoadingFlag: false});
      }).catch((error) => {
        this.setState({submitLoadingFlag: false});
        msgBoxShow(error.response.data.errorData.message, 'faild', null);
      });
    });
  }

  addContract() {
    const data = getNewData(this.props.formInfo.fields);
    const contractData = this.state.contractData;
    const len = contractData.length;
    if(len > 0) {
      data.id = contractData[len - 1].id + 1;
    }else {
      data.id = 1;
    }
    contractData.push(data);
    this.setState({ contractData });
  }

  deletContract(data) {
    const { getFieldsValue } = this.props.form;
    const fieldsValue = getFieldsValue();
    const fields = this.props.formInfo.fields;
    const dateArray = this.props.formInfo.fields.filter(field => field.inputType === 'DATE');
    const fieldId = data.id;
    if(this.state.contractData.length > this.props.formInfo.minCount) {
      const contractData = this.state.contractData;
      dealWithAddressData(fieldsValue);
      const multipleArry = [];
      for(let i = 0; i < contractData.length; i++) {
        const id = this.state.contractData[i].id;
        if(fieldId !== id) {
          const objOfmultiple = dealWithDateData(fieldsValue, i, id, fields, null, dateArray);
          multipleArry.push(Object.assign(objOfmultiple, {id: id}));
        }
      }
      this.setState({contractData: multipleArry});
    }
  }

  setSubFormCount(subFormName, count) {
    const subFormArray = this.state.subFormArray.map(form=>{
      if(form.name === subFormName) {
        form.count = count;
      }
      return form;
    });
    this.setState({subFormArray});
  }

  getReferCode() {
    const formValue = this.props.formValue;
    const referCode = formValue && formValue.loan_referCode;
    return referCode;
  }

  render() {
    const initData = this.props.formInfo.initData ? this.props.formInfo.initData : [];
    const detailType = this.props.detailType;
    const formValue = this.props.formValue;
    const isMultiple = this.props.formInfo.multiple;
    const allReadonly = this.props.formInfo.readOnly;
    const contractData = this.state.contractData;
    const contractCount = contractData ? contractData.length : 0;
    let isDocumentForm = this.props.formInfo.fields.some(e => e.inputType === 'DOCUMENT');
    let contractArray;
    const isReadonly = loanInfoData.isReadonly;
    let fields = null;
    const loanAppStatusCode = loanInfoData.loanAppStatusCode;
    const isIcrcControl = detailType === 'AUTOFLLOWUP' && loanInfoData.routingSystem === 'ICRC' && loanInfoData.loanStatus === 'HOLD';
    const flag = isReadonly === 'true' || detailType === 'AUTOFLLOWUP' || detailType === 'SIGN' || allReadonly;
    const readonlyFlag = isIcrcControl ? (isReadonly === 'true' || allReadonly) : flag;
    const referCode = this.getReferCode();
    const isPreAuthorize = loanInfoData.isPreAuthorize === 'true';
    const patt = /RELOAN/;
    const isReloanBankTab = patt.test(loanInfoData.loanType) && this.props.formInfo.name === 'PERSONAL_RELOAN_bankAccount';
    if(isMultiple) {
      contractArray = contractData && contractData.map((data, index) => {
        return (
          <div key={index} className="contract-div">
            <p className="contract-num">
              <label>{this.props.formInfo.label}{index + 1}</label>
                { contractCount > this.props.formInfo.minCount && !readonlyFlag &&
                  <Button onClick={this.deletContract.bind(this, data)}
                          className="delet">x 删除</Button>}
            </p>
            {
              this.props.formInfo.fields.map((val, idx)=> {
                let canNotEdit = false;
                let tempArray = null;
                let tempValue = null;
                if(initData.length > 0) {
                  canNotEdit = initData[index] && initData[index].some(field => {
                    return  field.name === val.name && field.readOnly === true;
                  });
                  tempArray = initData[index] && initData[index].filter(field =>{
                    return field.name === val.name && !!field.value;
                  });
                  tempValue = tempArray && (tempArray[0] ? tempArray[0].value : null);
                }
                if(val.fieldType === 'FORM') {
                  return (
                    <SubForm key={idx} formInfo={val} formValue={data && data[val.name]}
                             submitFlag={this.state.submitFlag}
                             isReadonly={readonlyFlag} form={this.props.form}
                             setValues={::this.setValuesBySubForm} values={this.state.values}
                             fileInfo={this.props.fileInfo} setSubFormCount={::this.setSubFormCount}/>);
                }
                if (readonlyFlag) {
                  return (
                    <FormFieldReadonly key={idx} val={val} idx={index}
                      label={data && data[val.name]}
                      form={this.props.form} multiple={isMultiple}
                      tempValue={tempValue} formInfo={this.props.formInfo}/>);
                }
                return (
                  <FormField key={idx} idx={index} fieldInfo={val} enterpriseFlag={this.state.enterpriseFlag}
                             handleProvinceChange={::this.handleProvinceChange} enterpriseSearchData={this.state.enterpriseSearchData}
                             arry={this.state.arry} id={data.id} enterpriseData={this.state.enterpriseData} bankOptions={this.state.bankOptions}  
                             fieldValue={data && data[val.name]} getChildChange={::this.getChildChange}
                             multiple={isMultiple} form={this.props.form} reRenderData={::this.reRenderData}
                             canNotEdit={canNotEdit} tempValue={tempValue} formInfo={this.props.formInfo}/>);
              })
            }
          </div>
        );
      });
    }else {
      fields = this.props.formInfo.fields.map((val, idx)=> {
        let canNotEdit = false;
        let tempArray = null;
        let tempValue = null;
        if(initData.length > 0) {
          canNotEdit = initData[0].some(field => field.name === val.name && field.readOnly === true);
          tempArray = initData[0].filter(field => field.name === val.name && !!field.value);
          tempValue = tempArray && (tempArray[0] ? tempArray[0].value : null);
        }
        if(val.fieldType === 'FORM') {
          isDocumentForm = val && val.fields && val.fields.some(e => e.inputType === 'DOCUMENT');
          if(!isDocumentForm) {
            val.fields.some(x => {
              isDocumentForm = x && x.fields && x.fields.some(e => e.inputType === 'DOCUMENT');
            });
          }
          return (
            <SubForm formInfo={val} key={idx} formValue={formValue && formValue[val.name]}
                     submitFlag={this.state.submitFlag}
                     isReadonly={readonlyFlag} form={this.props.form}
                     setValues={::this.setValuesBySubForm} values={this.state.values}
                     fileInfo={this.props.fileInfo} setSubFormCount={::this.setSubFormCount}/>);
        }
        if(readonlyFlag && !this.props.isCommonField) {
          return (
            <FormFieldReadonly val={val} key={idx} label={formValue && formValue[val.name]}
                               fileInfo={this.props.fileInfo} form={this.props.form}
                               multiple={isMultiple} tempValue={tempValue} referCode={referCode}
                               formInfo={this.props.formInfo} />);
        }
        return (
          <FormField key={idx} fieldInfo={val} fileInfo={this.props.fileInfo}  enterpriseFlag={this.state.enterpriseFlag}
                     handleProvinceChange={::this.handleProvinceChange} enterpriseData={this.state.enterpriseData}
                     cities={this.state.cities} canNotEdit={canNotEdit} getChildChange={::this.getChildChange} bankOptions={this.state.bankOptions}
                     fieldValue={formValue && formValue[val.name]} form={this.props.form} enterpriseSearchData={this.state.enterpriseSearchData}
                     multiple={isMultiple} tempValue={tempValue} referCode={referCode} reRenderData={::this.reRenderData}
                     formInfo={this.props.formInfo} isCommonField={this.props.isCommonField}/>);
      });
    }
    return(
      <div>
        <Form action={this.props.formInfo.url} >
          {!readonlyFlag && isMultiple && ((contractCount < this.props.formInfo.maxCount) || !this.props.formInfo.maxCount ) && <Button onClick={this.addContract.bind(this)}>添加{this.props.formInfo.label}</Button>}
          {isMultiple &&
           (contractCount > 0 ?
              <div ref="contract">{contractArray}</div>
                :
                  <p className="contract-num">无{this.props.formInfo.label}</p>)
          }
          {!isMultiple && fields}
          {isReloanBankTab &&
          <div>
            <h3 className="sub-form-title">代扣银行卡</h3>
            <div className="row col-cell-group">
              <div className="col-cell tab-div">
                <p className="tab-p"><label className="cell-label tab-label">银行卡持有人姓名</label></p>
                <span>{this.state.reloanBankInfo.accN && loanInfoData.cusName}</span>
              </div>
              <div className="col-cell tab-div">
                <p className="tab-p"><label className="cell-label tab-label">银行卡号</label></p>
                <span>{this.state.reloanBankInfo.accN}</span>
              </div>
            </div>
            <div className="row col-cell-group">
              <div className="col-cell tab-div">
                <p className="tab-p"><label className="cell-label tab-label">发卡银行</label></p>
                <span>{this.state.reloanBankInfo.extInstitution}</span>
              </div>
              <div className="col-cell tab-div">
                <p className="tab-p"><label className="cell-label tab-label">开户行所在省市</label></p>
                <span>{this.state.reloanBankInfo.extBranchName}</span>
              </div>
            </div>
          </div>}
          {(this.props.isCommonField || (!readonlyFlag && (loanAppStatusCode === 'CREATED' || loanAppStatusCode === 'NEW' || isIcrcControl) )) &&
            <div id="saveBtn">
              <div className="require-tip">
                (<span>*</span>表示必填项表示必填项）
              </div>
              {!isDocumentForm && !isPreAuthorize &&
                (this.props.isCommonField ?
                  <Button type="ghost" loading={this.state.submitLoadingFlag} onClick={this.commonFormSubmit.bind(this)} >保存修改</Button>
                  : <Button type="ghost" loading={this.state.submitLoadingFlag} onClick={this.formSubmit.bind(this)} >保存修改</Button>)}
            </div>}
          {isPreAuthorize && <Button type="ghost" loading={this.state.submitLoadingFlag} onClick={this.commonFormSubmit.bind(this)} >创建借款</Button>}
        </Form>
      </div>
    );
  }
}
export default Form.create()(DynamicForm);
DynamicForm.contextTypes = {
  product: React.PropTypes.string,
  originalLoanAppId: React.PropTypes.string
};

function getNewData(fields) {
  let obj = {};
  if(fields.length) {
    fields.forEach((val)=> {
      obj[val.name] = null;
    });
  }
  return obj;
}

function initContractData(fields, minCount) {
  let array = [];
  for(let i = 0; i < minCount; i++) {
    let obj = {};
    obj.id = i + 1;
    if(fields.length) {
      fields.forEach((val)=> {
        obj[val.name] = null;
      });
    }
    array.push(obj);
  }
  return array;
}

// function convertURL(url, name) {
//   const obj = {
//     aid: loanInfoData.aId,
//     appId: loanInfoData.loanId,
//     formCode: name
//   };
//   let url1;
//   Object.keys(obj).forEach(key =>{
//     url1 = url.replace(`{${key}}`, obj[key]);
//   });
//   return url1;
// }

function dealWithAddressData(values) {
  /* eslint no-loop-func: 0 */
  for(let props in values) {
    if(values.hasOwnProperty(props + '_district')) {
      values[props] = {
        province: values[props] && values[props][0] || null,
        city: values[props] && values[props][1] || null,
        district: values[props] && values[props][2] || null,
        detailedAddress: (typeof values[props + '_district'] === 'string' ? values[props + '_district'].trim() : values[props + '_district']) || null
      };
      delete values[props + '_district'];
    }
  }
}
function dealWithKeyChangeData(values) {
  for(let x in values) {
    if(x) {
      let first;
      let second;
      first = x.substr(0, x.length - 9);
      second = x.substr(x.length - 9, x.length);
      if(second === 'KeyChange') {
        let val = values[x];
        delete values[x];
        values[first] = val;
      }
    }
  }
}

// 处理date数据以及对象封装
function dealWithDateData(values, index, id, fields, subFormName, dateArray) {
  const obj = {};
  fields.forEach(field =>{
    let name = field.name;
    if(!!subFormName) {
      name = subFormName + '_' + name;
    }
    if(index !== null && index >= 0) {
      name = name + '_' + index + '_' + id;
    }
    const date = dateArray.filter(data => data.name === field.name);
    obj[field.name] = typeof values[name] === 'string' ? values[name].trim() : values[name];
    if(date.length && obj[field.name]) {
      obj[field.name] = moment(obj[field.name].format()).valueOf();
    }
    delete values[name];
  });
  return  obj;
}

// 文件上传回显
function fileConcept(type, img) {
  let resultType;
  let output;
  resultType = typeDistinguish(type);
  if (resultType === 'jpg' || resultType === 'png' || resultType === 'jpeg') {
    output = <img src={img} style={{width: '280px', height: '170px'}} />;
  } else if (resultType === 'xls' || resultType === 'xlsm' || resultType === 'xlsx') {
    output = <div className="excel" />;
  } else if (resultType === 'doc' || resultType === 'docx') {
    output = <div className="word" />;
  } else if (resultType === 'zip') {
    output = <div className="zip" />;
  } else if (resultType === 'rar') {
    output = <div className="rar" />;
  } else if (resultType === 'pdf') {
    output = <div className="pdf" />;
  }else {
    output = <div className="other" />;
  }
  return output;
}
// 文件类型提取
function typeDistinguish(type) {
  if(type) {
    let arr = type.split('.');
    let result = arr[arr.length - 1].toLowerCase();
    return result;
  }
  return '';
}

function getQueryString(name) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  const r = window.location.search.substr(1).match(reg);
  if (r !== null) {
    return r[2];
  }
  return null;
}

export {
    fileConcept
};

