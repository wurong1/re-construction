import React, {Component} from 'react';
import {Form, Input} from 'antd';
import _ from 'lodash';

const FormItem = Form.Item;

class IdCardInput extends Component {
    state = {
          
    };

  componentWillMount() {
    
  }

  valueChange = (e) => {
    const value = e.target.value;
    const showValue = showChange(value);
    const resultValue = _.camelCase(value).toUpperCase();
    const onChange = this.props.onChange;
    if(onChange) {
      onChange(resultValue);
    }  
  }

  render() { 
      const { disabled, value } = this.props;
      const showValue = showChange(value);
      return(
        <Input type="text" value={showValue} onChange={this.valueChange} disabled={disabled}/>
      )
    }
      
}

export default IdCardInput;

function showChange(val) {
  const value = _.camelCase(val).toUpperCase();
  const len = value.length;
  let resultValue = '';
  if(len > 4){
    value && value.split('').forEach((val, index) => {
      if((index + 1) % 4 === 0){
        if(index === len - 1 && len % 4 === 0){
          resultValue += `${val}`;
        }else {
          resultValue += `${val} `;
        }    
      }else {
        resultValue += `${val}`;
      }
    })
    return resultValue;
  }else {
    return val;
  }
}