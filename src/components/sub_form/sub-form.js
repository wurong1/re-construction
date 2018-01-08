import { Button, Icon, Row, Col} from 'antd';
import React, {Component} from 'react';
import FormField from '../form_field/form-field';
import city from '../../constants/city';
import FormFieldReadonly from '../form_field_readonly/form_field_readonly';
import moment from 'moment';
class SubForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      multipleData: [],
      arry: [],
      newSubForm: null,
      disableAdd: false
    };
  }

  componentWillMount() {
    const isMultiple = this.props.formInfo.multiple;
    if(isMultiple) {
      // let multipleData = this.props.formValue ? this.props.formValue : initmultipleData(this.props.formInfo.fields, this.props.formInfo.minCount);
      // if(multipleData.length < 1) {
      //   multipleData = initmultipleData(this.props.formInfo.fields, this.props.formInfo.minCount);
      // }
      this.setState({multipleData: this.props.formValue ? this.props.formValue : []});
    }
  }

  componentDidMount() {
    const count = this.state.multipleData.length;
    const subFormName = this.props.formInfo.name;
    this.props.setSubFormCount(subFormName, count);
  }

  componentWillReceiveProps(nextProps) {
    const isUpdate = this.props.submitFlag !== nextProps.submitFlag;
    const values = nextProps.values;
    if(values && isUpdate) {
      const subFormName = this.props.formInfo.name;
      const formValue = values[subFormName];
      this.setState({disableAdd: false});
      this.setState({newSubForm: null}, () => this.setState({multipleData: formValue}));
    }
  }

  handleProvinceChange(idx, province) {
    const { setFieldsValue, getFieldValue} = this.props.form;
    const isMultiple = this.props.formInfo.multiple;
    const cities = city.filter((item) => item.label === province)[0];
    const arry = this.state.arry;
    const cityName = this.props.formInfo.fields.filter(field => field.inputType === 'CITY');
    const name = cityName[0] ? cityName[0].name : null;
    const subFormName = this.props.formInfo.name;
    let  cityValue = null;
    let  valueFlag = false;
    if(isMultiple) {
      cityValue = getFieldValue(subFormName + '_' + name + '_' + idx);
      valueFlag = !!cities && cities.children.some(data=>data.value === cityValue);
      if(!valueFlag) {
        setFieldsValue({[subFormName + '_' + name + '_' + idx]: null});
      }
      if(cities) {
        arry[idx] = cities.children || [];
        this.setState({arry});
      }else {
        arry[idx] = [];
        this.setState({arry});
      }
    }else {
      cityValue = getFieldValue(subFormName + '_' + name);
      valueFlag = !!cities && cities.children.some(data=>data.value === cityValue);
      if(!valueFlag) {
        setFieldsValue({[subFormName + '_' + name]: null});
      }
      if(cities) {
        this.setState({cities: cities.children || []});
      }else {
        this.setState({cities: []});
      }
    }
  }

  getFields() {
    const subFormName = this.props.formInfo.name;
    const initData = this.props.formInfo.initData ? this.props.formInfo.initData : [];
    const formValue = this.props.formValue;
    const isMultiple = this.props.formInfo.multiple;
    const multipleData = this.state.multipleData;
    const isReadonly = this.props.isReadonly;
    const allReadonly = this.props.formInfo.readOnly;
    const showDelBtn = !isReadonly && !allReadonly;
    let multipleArray;
    let fields;
    if(isMultiple) {
      multipleArray = multipleData && multipleData.map((data, index) => {
        const columName0 = this.props.formInfo.fields[0].name;
        const columName1 = this.props.formInfo.fields[1].name;
        const columName2 = this.props.formInfo.fields[2].name;
        const dataObj = {};
        dataObj[columName0] = data[columName0];
        dataObj[columName1] = data[columName1];
        dataObj[columName2] = data[columName2];
        const dataBody = this.getSubBody(index, dataObj, showDelBtn);
        return (
          <div key={index} className="sub-head-data">
             {dataBody}
             <div key={index} className="contract-div sub-form-div" style={{display: 'none'}} ref={subFormName + '_' + index}>
               <Col span={3} className="spread-icon">{null}</Col>
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
                   if(isReadonly || allReadonly) {
                     return  (
                       <FormFieldReadonly
                         key={idx} val={val} idx={index}
                         isSubForm subFormName={this.props.formInfo.name}
                         label={data && data[val.name]} form={this.props.form}
                         multiple={isMultiple} tempValue={tempValue}/>);
                   }
                   return (
                     <FormField
                       key={idx} idx={index} fieldInfo={val}
                       isSubForm subFormName={this.props.formInfo.name}
                       handleProvinceChange={::this.handleProvinceChange}
                       arry={this.state.arry} id={data.id}
                       fieldValue={data && data[val.name]} multiple={isMultiple}
                       form={this.props.form} canNotEdit={canNotEdit} tempValue={tempValue} formInfo={this.props.formInfo}/>);
                 })
               }
             </div>
           </div>);
      });
      return multipleArray;
    }
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
        return (
          <SubForm formInfo={val} key={idx} isChildSubForm
                   form={this.props.form}
                   isReadonly={this.props.isReadonly}
                   fileInfo={this.props.fileInfo} setSubFormCount={this.props.setSubFormCount}/>);
      }
      if(isReadonly || allReadonly) {
        return (
          <FormFieldReadonly
          key={idx} val={val} idx={idx} isSubForm
          subFormName={this.props.formInfo.name} fileInfo={this.props.fileInfo}
          label={formValue && formValue[val.name]} form={this.props.form}
          multiple={isMultiple} tempValue={tempValue}/>);
      }
      return (
        <FormField
          key={idx} fieldInfo={val} fileInfo={this.props.fileInfo}
          isSubForm subFormName={this.props.formInfo.name}
          handleProvinceChange={::this.handleProvinceChange}
          cities={this.state.cities} canNotEdit={canNotEdit}
          fieldValue={formValue && formValue[val.name]} form={this.props.form}
          multiple={isMultiple} tempValue={tempValue} formInfo={this.props.formInfo}/>);
    });
    return fields;
  }

  getSubHead() {
    const fields = this.props.formInfo.fields;
    const t0 = '序号';
    const t1 = fields[0] ? fields[0].label : null;
    const t2 = fields[1] ? fields[1].label : null;
    const t3 = fields[2] ? fields[2].label : null;
    const t4 = '操作';
    return (
      <Row>
        <Col span={3}>{t0}</Col>
        <Col span={5}>{t1}</Col>
        <Col span={5}>{t2}</Col>
        <Col span={5}>{t3}</Col>
        <Col span={5}>{t4}</Col>
      </Row>);
  }

  getSubBody(index, data, showDelBtn) {
    const fields = this.props.formInfo.fields;
    const valueArry = [];
    for(let props in data) {
      if(!!props) {
        const field = fields.filter(fld => fld.name === props)[0];
        const fieldType = field.inputType;
        const value = data[props];
        let str = '';
        switch (fieldType) {
        case 'ADDRESS':
          if (value && value.city === value.province) {
            delete  value.city;
          }
          for (let pro in value) {
            if (value[pro] !== '空') {
              str += value[pro];
            }
          }
          break;
        case 'SELECT':
          const selOption = field.options.filter(opt => opt.value === value)[0];
          str = selOption && selOption.name;
          break;
        case 'CHECK':
          if (value && value.length > 0) {
            let options = value.map((label)=> {
              return field.options && field.options.filter((val)=> {
                return val.value === label;
              });
            });
            if (options && options.length > 0) {
              options.forEach((opt, idx)=> {
                if (idx < options.length - 1) {
                  str += opt[0].name + ' ,';
                } else {
                  str += opt[0].name;
                }
              });
            }
          }
          break;
        case 'DATE':
          if (value) {
            str = moment(value).format('YYYY-MM-DD');
          }
          break;
        default:
          str = value;
        }
        valueArry.push(str);
      }
    }
    const canDel = (this.state.multipleData.length > this.props.formInfo.minCount) && !this.state.disableAdd;
    return (
      <Row>
        <Col span={3}>{index + 1}</Col>
        <Col span={5}>{valueArry[0]}</Col>
        <Col span={5}>{valueArry[1]}</Col>
        <Col span={5}>{valueArry[2]}</Col>
        <Col span={5}>
          <Button className="spread" onClick={e=>this.spread(index, e)}>展开</Button>
          {showDelBtn && <Button className="sub-form-del" onClick={e=>this.deletForm(index, e)} disabled={!canDel}>删除</Button>}
        </Col>
      </Row>
    );
  }

  addForm() {
    const subFormName = this.props.formInfo.name;
    const multipleData = this.state.multipleData;
    const isMultiple = this.props.formInfo.multiple;
    const count = multipleData ? multipleData.length : 0;
    const initData = this.props.formInfo.initData ? this.props.formInfo.initData : [];
    let id;
    if(count > 0) {
      id = multipleData[count - 1].id + 1;
    }else {
      id = 1;
    }
    const newSubForm = (
      <div className="contract-div sub-form-div sub-form-add">
        <h3 className="sub-form-title">新增{this.props.formInfo.label}</h3>
        <Button className="sub-canel" onClick={this.cancelForm.bind(this)}>取消</Button>
        <div>
          {
            this.props.formInfo.fields.map((val, idx)=> {
              let canNotEdit = false;
              let tempArray = null;
              let tempValue = null;
              if(initData.length > 0) {
                canNotEdit = initData[count] && initData[count].some(field => {
                  return  field.name === val.name && field.readOnly === true;
                });
                tempArray = initData[count] && initData[count].filter(field =>{
                  return field.name === val.name && !!field.value;
                });
                tempValue = tempArray && (tempArray[0] ? tempArray[0].value : null);
              }
              return (
                <FormField
                  key={idx} idx={count} fieldInfo={val}
                  isSubForm subFormName={this.props.formInfo.name}
                  handleProvinceChange={::this.handleProvinceChange}
                  arry={this.state.arry}
                  fieldValue={null} multiple={isMultiple} id={id}
                  form={this.props.form} canNotEdit={canNotEdit} tempValue={tempValue} formInfo={this.props.formInfo}/>
              );
            })
          }
        <div className="require-tip">
            (<span>*</span>表示必填项表示必填项）
        </div>
        </div>
    </div>);
    this.setState({newSubForm: newSubForm});
    this.setState({disableAdd: true});
    this.props.setSubFormCount(subFormName, count + 1);
  }

  cancelForm() {
    const subFormName = this.props.formInfo.name;
    this.setState({disableAdd: false});
    this.setState({newSubForm: null});
    let count = this.state.multipleData ? this.state.multipleData.length : 0;
    this.props.setSubFormCount(subFormName, count);
  }

  deletForm(idx, event) {
    if(this.state.multipleData.length > this.props.formInfo.minCount) {
      const multipleData = this.state.multipleData.filter((data, index) => index !== idx);
      const subFormName = this.props.formInfo.name;
      const subFormValue = {};
      let count = multipleData.length;
      subFormValue[subFormName] = multipleData;
      this.setState({multipleData});
      this.props.setValues(subFormValue);
      this.props.setSubFormCount(subFormName, count);
    }
    event.stopPropagation();
  }

  spread(index, event) {
    const subFormName = this.props.formInfo.name;
    const self = event.target;
    if(self.innerText === '收起') {
      this.refs[subFormName + '_' + index].style.display = 'none';
      self.innerText = '展开';
    }else {
      this.refs[subFormName + '_' + index].style.display = 'block';
      self.innerText = '收起';
    }
  }

  render() {
    const fileds = this.getFields();
    const head = this.getSubHead();
    const isMultiple = this.props.formInfo.multiple;
    const isReadonly = this.props.isReadonly;
    const allReadonly = this.props.formInfo.readOnly;
    const multipleData = this.state.multipleData;
    const multipleCount = multipleData ? multipleData.length : 0;
    const includeChildSubForm = this.props.formInfo.fields.some(field => field.fieldType === 'FORM');
    const isChildSubForm = this.props.isChildSubForm;
    return(
      <div>
            <h3 className={`sub-form-title ${includeChildSubForm ? 'fist-title' : ''} ${isChildSubForm ? 'secd-title' : ''}`}>{this.props.formInfo.label}</h3>
            {isMultiple && !allReadonly && !isReadonly && ((multipleCount < this.props.formInfo.maxCount) || !this.props.formInfo.maxCount )
               && <Button className="sub-add" onClick={this.addForm.bind(this)} disabled={this.state.disableAdd}><Icon type="plus" />新增</Button>}
            {this.props.formInfo.minCount > 0 &&
              <div className="require-tip count-tip">
                (<span>*</span>至少添加{this.props.formInfo.minCount}条{this.props.formInfo.label}）
              </div>}
            {this.state.newSubForm}
            {isMultiple && (multipleCount > 0) &&
              <div className="sub-form">
                {head}{fileds}
              </div>
            }
            {!isMultiple &&
              <div className={`doc-sub-form ${includeChildSubForm ? 'border' : ''}`}>
                  {fileds}
              </div>
            }
        </div>
    );
  }
}
export default SubForm;

// function initmultipleData(fields, minCount) {
//   let array = [];
//   for(let i = 0; i < minCount; i++) {
//     let obj = {};
//     if(fields.length) {
//       fields.forEach((val)=> {
//         obj[val.name] = null;
//       });
//     }
//     array.push(obj);
//   }
//   return array;
// }


