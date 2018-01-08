import React, { Component } from 'react';
import { Form, Input, Select, Button, Spin, message } from 'antd';
import province from '../../constants/province';
import city from '../../constants/city';
import bankList from '../../constants/bank';
import { remote } from '../../utils/fetch';

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 14,
      offset: 6,
    },
  },
};

class DeductCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cascadeCitys: this.getCities() || [],
      loading: false,
    };
  }

  getCities = () => {
    const { bankProvince } = this.props.cardValue;
    let cascadeCitys = [];
    if (bankProvince) {
      const cities = city.find(item => item.label === bankProvince);
      cascadeCitys = cities && cities.children;
    }
    return cascadeCitys;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { loanId, docId } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        remote({
          method: 'POST',
          url: `/borrower/${loanId}/card/${docId}`,
          data: values,
        }).then(() => {
          message.success('保存成功!');
          this.setState({ loading: false });
        }).catch(() => {
          this.setState({ loading: false });
        });
      }
    });
  }

  handleProvinceChange = (value) => {
    const { setFieldsValue } = this.props.form;
    const cities = city.find(item => item.label === value);
    this.setState({ cascadeCitys: (cities && cities.children) || [] });
    setFieldsValue({ bankCity: '' });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { cascadeCitys, loading } = this.state;
    const {
      cardValue: {
        accountName,
        bank,
        accountNum,
        bankPhone,
        bankProvince,
        bankCity,
        bankBranch,
      },
    } = this.props;
    return (
      <div>
        <Spin spinning={loading}>
          <Form onSubmit={this.handleSubmit} className="card-form">
            <FormItem
              {...formItemLayout}
              label="账户名称"
            >
              {getFieldDecorator('accountName', {
                initialValue: accountName,
                rules: [{
                  required: true, message: '不能为空！',
                }],
              })(
                <Input />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="账号"
            >
              {getFieldDecorator('accountNum', {
                initialValue: accountNum,
                rules: [{
                  required: true, message: '不能为空！',
                }],
              })(
                <Input />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="开户行"
            >
              {getFieldDecorator('bank', {
                initialValue: bank || '',
                rules: [{
                  required: true, message: '不能为空！',
                }],
              })(
                <Select showSearch>
                  <Option value="">-请选择-</Option>
                  {bankList && bankList.map((val, idx) => {
                    return <Option key={idx} value={val.value}>{val.value}</Option>;
                  })}
                </Select>,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="开户支行"
            >
              {getFieldDecorator('bankBranch', {
                initialValue: bankBranch,
              })(
                <Input />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="手机号码"
            >
              {getFieldDecorator('bankPhone', {
                initialValue: bankPhone,
              })(
                <Input />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="开户所在省"
            >
              {getFieldDecorator('bankProvince', {
                initialValue: bankProvince || '',
                rules: [{
                  required: true, message: '不能为空！',
                }],
              })(
                <Select showSearch onChange={this.handleProvinceChange}>
                  <Option value="">-请选择-</Option>
                  {province && province.map((val, idx) => {
                    return <Option key={idx} value={val.value}>{val.value}</Option>;
                  })}
                </Select>,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="开户所在市"
            >
              {getFieldDecorator('bankCity', {
                initialValue: bankCity || '',
                rules: [{
                  required: true, message: '不能为空！',
                }],
              })(
                <Select showSearch>
                  <Option value="">-请选择-</Option>
                  {
                    cascadeCitys && cascadeCitys.map((val, idx) => {
                      return <Option key={idx} value={val.value}>{val.value}</Option>;
                    })
                }
                </Select>,
              )}
            </FormItem>
            <FormItem {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit">提交</Button>
            </FormItem>
          </Form>
        </Spin>
      </div>
    );
  }
}

export default Form.create()(DeductCard);
