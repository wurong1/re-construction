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

class IssueCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cascadeCitys: this.getCities() || [],
      isRequired: this.props.cardValue.accountType === 'PERSONAL',
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

  hadleAccountTypeChange = (value) => {
    const accountType = value;
    const isRequired = accountType === 'PERSONAL';
    this.setState({ isRequired }, () => {
      this.props.form.validateFields(['bankIdCard'], { force: true });
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { cascadeCitys, isRequired, loading } = this.state;
    const {
      cardValue: {
        accountName,
        bank,
        accountNum,
        bankPhone,
        bankProvince,
        bankCity,
        accountType,
        bankBranch,
        bankIdCard,
        ownerType,
      },
      type,
    } = this.props;
    return (
      <div>
        <Spin spinning={loading}>
          <Form onSubmit={this.handleSubmit} className="card-form">
            {
              type === 'other' &&
                <FormItem
                  {...formItemLayout}
                  label="账户持有人类型"
                >
                  {getFieldDecorator('ownerType', {
                    initialValue: ownerType || '',
                    rules: [{
                      required: true, message: '不能为空！',
                    }],
                  })(
                    <Select>
                      <Option value="">-请选择-</Option>
                      <Option value="BORROWER">借款人</Option>
                    </Select>,
                  )}
                </FormItem>
            }
            {
              type === 'other' ?
                <FormItem
                  {...formItemLayout}
                  label="收款帐户类型"
                >
                  {getFieldDecorator('accountType', {
                    initialValue: accountType || '',
                    rules: [{
                      required: true, message: '不能为空！',
                    }],
                  })(
                    <Select onChange={this.hadleAccountTypeChange}>
                      <Option value="">-请选择-</Option>
                      <Option value="PERSONAL">个人</Option>
                      <Option value="BUSINESS">企业</Option>
                    </Select>,
                  )}
                </FormItem>
              :
                <FormItem
                  {...formItemLayout}
                  label="收款帐户类型"
                >
                  {getFieldDecorator('accountType', {
                    initialValue: accountType || '',
                    rules: [{
                      required: true, message: '不能为空！',
                    }],
                  })(
                    <Select>
                      <Option value="">-请选择-</Option>
                      <Option value="PERSONAL">个人</Option>
                    </Select>,
                  )}
                </FormItem>
            }
            <FormItem
              {...formItemLayout}
              label={`${type === 'other' ? '账户名称' : '姓名'}`}
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
              label="银行账号"
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
            {
              type === 'other' &&
                <FormItem
                  {...formItemLayout}
                  label="支行名称"
                >
                  {getFieldDecorator('bankBranch', {
                    initialValue: bankBranch,
                    rules: [{
                      required: true, message: '不能为空！',
                    }],
                  })(
                    <Input />,
                  )}
                </FormItem>
            }
            {
              type === 'other' &&
                <FormItem
                  {...formItemLayout}
                  label="银行预留身份证号"
                >
                  {getFieldDecorator('bankIdCard', {
                    initialValue: bankIdCard,
                    rules: [{
                      required: isRequired, message: '不能为空！',
                    }],
                  })(
                    <Input />,
                  )}
                </FormItem>
            }
            <FormItem
              {...formItemLayout}
              label="银行预留手机号"
            >
              {getFieldDecorator('bankPhone', {
                initialValue: bankPhone,
                rules: [{
                  required: true, message: '不能为空！',
                }],
              })(
                <Input />,
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

export default Form.create()(IssueCard);
