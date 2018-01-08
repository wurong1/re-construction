import React, {Component} from 'react';
import {Form, Input, Select, Checkbox, DatePicker, Cascader} from 'antd';
import moment from 'moment';
import _ from 'lodash';
import FileDisplayBox from '../file_display_box/file-display-box';
import IdCardInput from '../input/input_idcard';
import province from '../../constants/province';
import city from '../../constants/city';
import bank from '../../constants/bank';
import bAddress from '../../constants/bapp-address';
import loanInfoData from '../../constants/loan-info-data';
import { remote } from '../../utils/fetch';

class FormField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channelOptions: [],
      searchFlag: false,
      limitNum: 20
    };
    const referCode = props.referCode;
    if (referCode) {
      this.getChannelOptions(referCode);
    }
  }

  componentWillMount() {
    const name = this.props.fieldInfo.name;
    const val = this.props.fieldValue;
    if(loanInfoData.configProductCode === 'HIGH_SALARY') {
      if(name === 'job_highSalaryClientType') {
        this.props.getChildChange(val);
      }
    }
    if(name === 'bank_type' && val){
      this.props.getChildChange(val, name);
    }

  }

  componentDidMount() {
    const inputType = this.props.fieldInfo.inputType;
    const value = this.props.fieldValue;
    if (inputType === 'PROVINCE') {
      this.props.handleProvinceChange(this.props.idx, value );
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.referCode !== nextProps.referCode && nextProps.referCode) {
      this.getChannelOptions(nextProps.referCode);
    }
  }

  nullValidation(rule, data, callback) {
    callback();
  }

  validationRules(validate, otherRule, initialData, callback) {
    let result = null;
    let data = trim(initialData);
    const rule = validate.validation;
    const descript = validate.description;
    if (data) {
      if (rule) {
        if (('min' in rule) && ('max' in rule)) {
          let dataNumber = Number(data);
          if (('min' in rule) && ('max' in rule) && ('divide' in rule)) {
            if ((dataNumber >= rule.min) && (dataNumber <= rule.max)) {
              if(dataNumber % rule.divide === 0) {
                result =  'success';
              }else {
                result =  '您输入的数值不为' + rule.divide + '的倍数!';
              }
            }else if(dataNumber < rule.min) {
              result = '您输入的数值不能小于' + rule.min + '!';
            }else if(dataNumber > rule.max) {
              result = '您输入的数值不能大于' + rule.max + '!';
            }else {
              result = '该项输入应为一个数值!';
            }
          }else if (('min' in rule) && ('max' in rule)) {
            if ((dataNumber >= rule.min) && (dataNumber <= rule.max)) {
              result = 'success';
            } else if(dataNumber < rule.min) {
              result = '您输入的数值不能小于' + rule.min + '!';
            }else if(dataNumber > rule.max) {
              result = '您输入的数值不能大于' + rule.max + '!';
            }else {
              result = '该项输入应为一个数值!';
            }
          }
        }else if (('minLength' in rule) && ('maxLength' in rule)) {
          if ((data.length >= rule.minLength) && (data.length <= rule.maxLength)) {
            result = 'success';
          }else if(data.length < rule.minLength) {
            result = '您输入的长度不能少于' + rule.minLength + '个字符!';
          }else if(data.length > rule.maxLength) {
            result = '您输入的长度不能超过' + rule.maxLength + '个字符!';
          }
        }else if ('regex' in rule) {
          let re = new RegExp(rule.regex);
          if (re.test(data)) {
            result = 'success';
          }else {
            if(descript) {
              result =  descript;
            }else {
              result = '输入有误,请检查!';
            }
          }
        }else {
          result = 'success';
        }
      }else {
        result = 'success';
      }
    }else if (!data) {
      result = '不能为空!';
    }
    callback(result === 'success' ? undefined : result);
  }

  getChannelOptions(referCode) {
    const inputType = this.props.fieldInfo.inputType;
    const isChannel = inputType === 'CHANNEL';
    if(isChannel) {
      remote({
        method: 'GET',
        url: `/borrower/loadSalesChannelByRefererCode?refererCode=${referCode}`
      }).then((data) => {
        this.setState({channelOptions: data || [] });
      }).catch((e) => {
        msgBoxShow(e.response && e.response.data && e.response.data.errorData && e.response.data.errorData.message, 'faild', null);
      });
    }
  }

  handleChange(val) {
    const {setFieldsValue} = this.props.form;
    const name = this.props.fieldInfo.name;
    this.context.setConditionValues(name, val);
    this.handleCascadeChange();
    if(loanInfoData.configProductCode === 'HIGH_SALARY') {
      if(name === 'job_highSalaryClientType') {
        setFieldsValue({'job_companyNameKeyChange': null});
        this.getEnterpriseOption(val);
      }
    }
    if(name === 'bank_type'){
      setFieldsValue({'bank_bank': null});
      this.props.getChildChange(val, name);
    }
  }

  handleCascadeChange() {
    // select联动配置不支持跨表单

    const {setFieldsValue} = this.props.form;
    const fieldName = this.props.fieldInfo.name;
    const isMultiple = this.props.multiple ? true : false;
    const isSubForm = this.props.isSubForm;
    const subFormName = this.props.subFormName;
    this.context.cascadeConfig.forEach(obj => {
      if(obj.dependentFields.some(name => fieldName === name)) {
        let constraintName = obj.constraintName;
        if(isSubForm) {
          constraintName = subFormName + '_' + constraintName;
        }
        if(isMultiple) {
          constraintName = constraintName + '_' + this.props.idx + '_' + this.props.id;
        }
        setFieldsValue({[constraintName]: null});
      }
    });
  }

  getEnterpriseOption(val) {
    const {setFieldsValue} = this.props.form;
    setFieldsValue({'job_companyNameKeyChange': null});
    setFieldsValue({'job_companyName': null});
    this.context.setConditionValues(this.props.fieldInfo.name, val);
    this.props.getChildChange(val);
  }

  searchOption(val) {
    let matchData = this.props.enterpriseData.filter(item => item.name && item.name.indexOf(val) !== -1);
    this.props.reRenderData(matchData);
  }

  scrollOption() {
    let self = this;
    if(this.props.fieldInfo.name === 'job_companyName') {
      $( 'ul.ant-select-dropdown-menu' ).on('scroll', function() {
        if($(this).scrollTop() > (440 * self.state.limitNum / 20)) {
          self.setState({limitNum: self.state.limitNum + 20});
        }
      });
    }
    this.setState({limitNum: 20});
  }

  getConditionShow() {
    const {getFieldValue} = this.props.form;
    const isMultiple = this.props.multiple ? true : false;
    const isSubForm = this.props.isSubForm;
    const subFormName = this.props.subFormName;
    let conditionShow = this.props.fieldInfo.condition ? false : true;
    let conditionValue;
    if (!conditionShow) {
      let conFieldName = this.props.fieldInfo.condition.fieldName;
      const compareType = this.props.fieldInfo.condition.comparison;
      const isCrossForm = !(this.props.formInfo && this.props.formInfo.fields.some(f => f.name === conFieldName));
      if(isSubForm) {
        conFieldName = subFormName + '_' + conFieldName;
      }
      if(isMultiple) {
        conFieldName = conFieldName + '_' + this.props.idx + '_' + this.props.id;
      }
      conditionValue = isCrossForm ? this.context.conditionValues[this.props.fieldInfo.condition.fieldName] : getFieldValue(conFieldName);
      switch (compareType) {
        case 'EQ' :
          conditionShow =  conditionValue === this.props.fieldInfo.condition.value; break;
        case 'IN' :
          conditionShow =  this.props.fieldInfo.condition.value.split(',').some(val => val === conditionValue); break;
      }
    }
    return conditionShow;
  }

  getCascadeOptions() {
    const {getFieldValue} = this.props.form;
    const isMultiple = this.props.multiple ? true : false;
    const isSubForm = this.props.isSubForm;
    const subFormName = this.props.subFormName;
    const constraintRule = this.props.fieldInfo.constraintRule;
    let options = [];
    if(constraintRule) {
      const dependentFields = constraintRule.dependentFields || [];
      const rules = constraintRule.rules || [];
      const dependObj = {};
      let constraintName = this.props.fieldInfo.name;
      dependentFields.forEach(fieldName => {
        const isCrossForm = !(this.props.formInfo && this.props.formInfo.fields.some(f => f.name === fieldName));
        let cascadeName = fieldName;
        if(isCrossForm) {
          dependObj[fieldName] = this.context.conditionValues[fieldName];
        }else {
          if(isSubForm) {
            cascadeName = subFormName + '_' + cascadeName;
            constraintName = subFormName + '_' + constraintName;
          }
          if(isMultiple) {
            cascadeName = cascadeName + '_' + this.props.idx + '_' + this.props.id;
            constraintName = constraintName + '_' + this.props.idx + '_' + this.props.id;
          }
          dependObj[fieldName] = getFieldValue(cascadeName);
        }
      });
      const filterResult = rules.filter(rule => {
        let conditionStr = rule.condition;
        Object.keys(dependObj).forEach(props => {
          const reg = new RegExp(props, 'g');
          conditionStr = conditionStr.replace(reg, `'${dependObj[props]}'`);
        });
        try {
          return eval(conditionStr);
        } catch(error) {
          return false;
        }
      })[0];
      options = filterResult ? filterResult.value : [];
    }
    return options;
  }

  render() {
    const tempValue = this.props.tempValue;
    const value = this.props.fieldValue;
    let inputType = this.props.fieldInfo.inputType;
    const label = this.props.fieldInfo.label;
    const isRequired = this.props.fieldInfo.inputOption === 'REQUIRED';
    const isDate = inputType === 'DATE';
    const isAddress = inputType === 'ADDRESS';
    const isProvince = inputType === 'PROVINCE';
    const isCity = inputType === 'CITY';
    const isDocument = inputType === 'DOCUMENT';
    const isCheck = inputType === 'CHECK';
    const isMultiple = this.props.multiple ? true : false;
    const isSubForm = this.props.isSubForm;
    const subFormName = this.props.subFormName;
    const detailAddress = (isAddress && value) ? value.detailedAddress : null;
    const addressData = (isAddress && value) ? formatAddress(value) : null;
    const readOnlyAddress = addressData ? addressData.join('/') : null;
    const isProvinceRight = isProvince && isRightProvince(value, province);
    const isCityRight = isCity && isRightCity(value, city);
    const dateFormat = 'YYYY-MM-DD';
    const date = (isDate && value) ? moment(value).format(dateFormat) : value;
    const validation = {validation: this.props.fieldInfo.validation, description: this.props.fieldInfo.description};
    const CheckboxGroup = Checkbox.Group;
    const Option = Select.Option;
    const { getFieldDecorator} = this.props.form;
    const FormItem = Form.Item;
    const canNotEdit = (tempValue ? true : this.props.canNotEdit) || (this.props.fieldInfo.readOnly ? true : false);
    const isCascade = this.props.fieldInfo.constraintRule ? true : false;
    const cascadeOptions = isCascade ? this.getCascadeOptions() : [];
    const options = [];
    let initValue = tempValue ? tempValue : this.props.fieldValue;
    let conditionShow = this.getConditionShow();
    let applyName = this.props.fieldInfo.name;
    let input;
    const isEnterprise = this.props.fieldInfo.name === 'job_companyName' ? this.props.enterpriseFlag : false;
    const showLen = this.state.limitNum;
    const showEnterprise = this.props.enterpriseSearchData && this.props.enterpriseSearchData.length > 0 ? this.props.enterpriseSearchData : this.props.enterpriseData;
    // 预授信推荐人CODE
    const loanReferCode = this.context.reloanInfo.loanReferCode;
    // 预授贷款类型
    const isPreAuthorize = loanInfoData.isPreAuthorize === 'true';
    const isCardNum = applyName === 'user_cardNum' || applyName === 'contact_cardNum';
    const bankOptions = this.props.bankOptions;
    if(isEnterprise) {
      inputType = 'SELECT';
      applyName = applyName + 'KeyChange';
    }
    if (!conditionShow) return (null);
    if(isSubForm) {
      applyName = subFormName + '_' + applyName;
    }
    if(isMultiple) {
      const idx = this.props.idx;
      applyName = applyName + '_' + idx + '_' + this.props.id;
    }
    if(initValue === 0) {
      initValue = initValue.toString();
    }
    if(isCheck) {
      this.props.fieldInfo.options.forEach(option => options.push({label: option.name, value: option.value}));
    }
    switch (inputType) {
    case 'TEXT':
      if(isCardNum){
        input = getFieldDecorator(applyName, {
          initialValue: initValue,
          rules: [{
            validator: isRequired ? this.validationRules.bind(this, validation) : this.nullValidation
          }]
        })(<IdCardInput disabled={canNotEdit}/>);
      }else {
        input = getFieldDecorator(applyName, {
          onChange: this.handleCascadeChange.bind(this),
          initialValue: applyName === 'loan_referCode' && isPreAuthorize ? loanReferCode : initValue,
          rules: [{
            validator: isRequired ? this.validationRules.bind(this, validation) : this.nullValidation
          }]
        })(<Input type="text" disabled={applyName === 'loan_referCode' && isPreAuthorize ? true : canNotEdit}/>);
      }
      break;
    case 'SELECT':
      if(!isEnterprise) {
        input = getFieldDecorator(applyName, {
          onChange: this.handleChange.bind(this),
          initialValue: initValue,
          rules: [{
            validator: isRequired ? this.validationRules.bind(this, validation) : this.nullValidation
          }]
        })(
            <Select size="large" disabled={canNotEdit} showSearch optionFilterProp="children">
              {isCascade ?
                  cascadeOptions.filter((val)=>val.name).map((val)=>{
                    return <Option key={val && val.value} value={val && val.value}>{val.name}</Option>;
                  })
                  : this.props.fieldInfo.options && this.props.fieldInfo.options.filter((val)=>val.name).map((val)=>{
                    return <Option key={val && val.value} value={val && val.value}>{val.name}</Option>;
                  })}
            </Select>);
      }else {
        input = getFieldDecorator(applyName, {
          onChange: this.handleChange.bind(this),
          initialValue: initValue,
          rules: [{
            validator: isRequired ? this.validationRules.bind(this, validation) : this.nullValidation
          }]
        })(
            <Select size="large" disabled={canNotEdit} onFocus={this.scrollOption.bind(this)} onSearch={this.searchOption.bind(this)} showSearch >
              {
                showEnterprise && showEnterprise.map(function (item, index) {
                  let result;
                  if(index < showLen) {
                    result = <Option key={item && item.name} value={item && item.name}>{item.name}</Option>;
                  } else {
                    result = [];
                  }
                  return result;
                })
              }
            </Select>
        );
      }
      break;
    case 'CHANNEL':
      input = getFieldDecorator(applyName, {
        onChange: this.handleChange.bind(this),
        initialValue: initValue && initValue.toString(),
        rules: [{
          validator: isRequired ? this.validationRules.bind(this, validation) : this.nullValidation
        }]
      })(
        <Select size="large" disabled={canNotEdit} showSearch optionFilterProp="children">
          {this.state.channelOptions && this.state.channelOptions.filter((val)=>val.projectId && val.projectName).map((val)=>{
            return <Option key={val && val.projectId} value={val && val.projectId && (val.projectId).toString()}>{val.projectName}</Option>;
          })}
        </Select>);
      break;
    case 'DATE':
      input = getFieldDecorator(applyName, {
        initialValue: date && moment(date, dateFormat),
        rules: [{
          type: 'object'
        }, {
          validator: isRequired ? this.validationRules.bind(this, validation) : this.nullValidation
        }]
      })(<DatePicker format={dateFormat} disabled={canNotEdit}/>);
      break;
    case 'ADDRESS':
      !canNotEdit ?
        input = getFieldDecorator(applyName, {
          initialValue: initValue ? addressData : null,
          rules: [{
            validator: isRequired ? this.validationRules.bind(this, validation) : this.nullValidation
          }]
        })(<Cascader options={bAddress} showSearch />)
        :
        input = getFieldDecorator(applyName, {
          initialValue: initValue ? readOnlyAddress : null,
          rules: [{
            validator: isRequired ? this.validationRules.bind(this, validation) : this.nullValidation
          }]
        })(<Input type="text" disabled />);
      break;
    case 'TEXT_AREA':
      input = getFieldDecorator(applyName, {
        initialValue: initValue,
        rules: [{
          validator: isRequired ? this.validationRules.bind(this, validation) : this.nullValidation
        }]
      })(<Input type="textarea" name={name} disabled={canNotEdit} rows={4}/>);
      break;
    case 'PROVINCE':
      isProvinceRight ?
        input = getFieldDecorator(applyName, {
          onChange: this.props.handleProvinceChange.bind(this, this.props.idx),
          initialValue: initValue,
          rules: [{
            validator: isRequired ? this.validationRules.bind(this, validation) : this.nullValidation
          }]
        })(<Select disabled={canNotEdit} showSearch>
            {province.map((val)=>{
              return <Option key={val.value} value={val.value}>{val.value}</Option>;
            })
            }
        </Select>)
        :
        input = getFieldDecorator(applyName, {
          initialValue: initValue
        })(<Input type="text" disabled/>)
        ;break;
    case 'CITY':
      isCityRight ?
        input = getFieldDecorator(applyName, {
          initialValue: initValue,
          rules: [{
            validator: isRequired ? this.validationRules.bind(this, validation) : this.nullValidation
          }]
        })(
          <Select disabled={canNotEdit} showSearch>
            {isMultiple ?
              this.props.arry[this.props.idx] && this.props.arry[this.props.idx].map((val)=>{
                return <Option key={val.value} value={val.value}>{val.value}</Option>;
              })
                :
                  this.props.cities && this.props.cities.map((val)=>{
                    return <Option key={val.value} value={val.value}>{val.value}</Option>;
                  })
            }
          </Select>)
        :
          input = getFieldDecorator(applyName, {
            initialValue: initValue
          })(<Input type="text" disabled/>);
      break;
    case 'BANK':
      input = getFieldDecorator(applyName, {
          onChange: this.handleChange.bind(this),
          initialValue: initValue,
          rules: [{
            validator: isRequired ? this.validationRules.bind(this, validation) : this.nullValidation
          }]
        })(
            <Select size="large" disabled={canNotEdit} showSearch optionFilterProp="children">
              {
                bankOptions && bankOptions.map(val => {
                  return <Option value={val && val.bankName}>{val && val.bankName}</Option>
                })
              }
            </Select>);
      break;
    case 'BANK_DEDUCT':
      input = getFieldDecorator(applyName, {
        initialValue: initValue,
        rules: [{
          validator: isRequired ? this.validationRules.bind(this, validation) : this.nullValidation
        }]
      })(
        <Select disabled={canNotEdit} showSearch>
          {bank && bank.map((val)=>{
            return <Option key={val.value} value={val.value}>{val.value}</Option>;
          })}
        </Select>);
      break;
    case 'BANK_BRANCH':
      input = getFieldDecorator(applyName, {
        initialValue: initValue,
        rules: [{
          validator: isRequired ? this.validationRules.bind(this, validation) : this.nullValidation
        }]
      })(<Input type="text" disabled={canNotEdit} />);
      break;
    case 'CHECK':
      input = getFieldDecorator(applyName, {
        initialValue: initValue,
        rules: [{
          validator: isRequired ? this.validationRules.bind(this, validation) : this.nullValidation
        }]
      })(<CheckboxGroup options={options} />);
      break;
    case 'DOCUMENT':
      input = <FileDisplayBox fieldInfo={this.props.fieldInfo} fileInfo={this.props.fileInfo}/>;
      break;
    default:input = <label>{initValue}</label>;
    }
    return(
      isDocument ?
        <div className="document-group">
            {input}
        </div>
          :
            <span className = {this.props.isCommonField ? 'common-field' : ''}>
              <FormItem label={label}  className={isRequired ? 'required' : ''} hasFeedback={false} >
                {input}
              </FormItem >
                {isAddress && !canNotEdit &&
                  <FormItem label={label + '_详细地址'}  className={isRequired ? 'required' : ''} hasFeedback={false}>
                    {getFieldDecorator(applyName + '_district', {
                      initialValue: detailAddress,
                      rules: [{
                        validator: isRequired ? this.validationRules.bind(this, validation) : this.nullValidation
                      }]
                    })(<Input type="text" placeholder="详细地址" disabled={canNotEdit} />)}
               </FormItem>}
            </span>
    );
  }
}

export default FormField;

function formatAddress(addr) {
  const source = loanInfoData.configCode;
  if(source === 'BORROWER_APP') {
    return addr && [addr.province, addr.city, addr.district];
  }
  return [addr.province, addr.city, addr.district];
}

function trimLeft(s) {
  if(!s) {
    return null;
  }
  const whitespace = ' \t\n\r';
  let str = s + '';
  if (whitespace.indexOf(str.charAt(0)) !== -1) {
    let j = 0;
    let i = str.length;
    while (j < i && whitespace.indexOf(str.charAt(j)) !== -1) {
      j++;
    }
    str = str.substring(j, i);
  }
  return str;
}

function trimRight(s) {
  if(!s) return null;
  const whitespace = ' \t\n\r';
  let str = s + '';
  if (whitespace.indexOf(str.charAt(str.length - 1)) !== -1) {
    let i = str.length - 1;
    while (i >= 0 && whitespace.indexOf(str.charAt(i)) !== -1) {
      i--;
    }
    str = str.substring(0, i + 1);
  }
  return str;
}

function trim(s) {
  return trimRight(trimLeft(s));
}

function isRightProvince(value, prov) {
  if(value) {
    return prov.some(data => data.value === value);
  }
  return true;
}

function isRightCity(value, cy) {
  if(value) {
    return cy.some(data => {
      if(data.children) {
        return  data.children.some( child => child.value === value);
      }
      return true;
    });
  }
  return true;
}

FormField.contextTypes = {
  conditionValues: React.PropTypes.object,
  cascadeConfig: React.PropTypes.array,
  setConditionValues: React.PropTypes.func,
  reloanInfo: React.PropTypes.object
};