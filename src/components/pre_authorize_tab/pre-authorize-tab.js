import React, {Component} from 'react';
import moment from 'moment';

class PreAuthorizeTab extends Component {
  getRiskRate() {
    const recommendedMaturity = this.context.reloanInfo.recommendedMaturity;
    const name = `riskRate${recommendedMaturity}M`;
    const riskRate = this.context.reloanInfo.feeRate && this.context.reloanInfo.feeRate[name];
    return riskRate;
  }

  render() {
    const riskRate = this.getRiskRate();
    const maturity = this.context.reloanInfo.recommendedMaturity || 0;
    const fee = this.context.reloanInfo.contractAmount || 0;
    const feeRate = this.context.reloanInfo.feeRate && this.context.reloanInfo.feeRate.origFee || 0;
    const manageRate = this.context.reloanInfo.feeRate && this.context.reloanInfo.feeRate.managementFee || 0;
    const interviewFee = parseInt(fee * feeRate, 10) / 100;
    const manageFee = parseInt(fee * manageRate * maturity, 10) / 100;
    const protectFee = parseInt(fee * riskRate, 10) / 100;
    const tjFee = interviewFee + manageFee + protectFee;
    let date = this.context.reloanInfo.expiryDate;
    const dateFormat = 'YYYY-MM-DD';
    date = date &&  moment(date).format(dateFormat);
    return (
      <div>
        <div className="task-step-title" style={{'marginBottom': '15px'}}>
          <h5>授信信息</h5>
        </div>
        <div className="row col-cell-group">
          <div className="col-xs-4 col-cell">
            <p><label className="cell-label ">原合同金额</label></p>
            <span>{this.context.reloanInfo.originalAmount}</span>
          </div>
          <div className="col-xs-6 col-cell">
            <p><label className="cell-label ">原到手金额</label></p>
            <span>{this.context.reloanInfo.originalFinalAmount}</span>
            <span></span>
          </div>
        </div>
        <div className="row col-cell-group">
          <div className="col-xs-4 col-cell">
            <p><label className="cell-label ">预授信合同金额</label></p>
            <span>{this.context.reloanInfo.contractAmount}</span>
          </div>
          <div className="col-xs-6 col-cell">
            <p><label className="cell-label ">预授信到手金额</label></p>
            <span>{this.context.reloanInfo.finalAmount}</span>
          </div>
        </div>
        <div className="row col-cell-group">
          <div className="col-xs-4 col-cell">
            <p><label className="cell-label ">审批费率</label></p>
            <span>{feeRate}%</span>
          </div>
          <div className="col-xs-6 col-cell">
            <p><label className="cell-label ">居间服务费</label></p>
            <span>{interviewFee}</span>
          </div>
        </div>
        <div className="row col-cell-group">
          <div className="col-xs-4 col-cell">
            <p><label className="cell-label ">管理费率</label></p>
            <span>{manageRate}%</span>
          </div>
          <div className="col-xs-6 col-cell">
            <p><label className="cell-label ">账户管理费金额</label></p>
            <span>{manageFee}</span>
          </div>
        </div>
        <div className="row col-cell-group">
          <div className="col-xs-4 col-cell">
            <p><label className="cell-label ">借款人履约互保准备金率</label></p>
            <span>{riskRate}%</span>
          </div>
          <div className="col-xs-6 col-cell">
            <p><label className="cell-label ">借款人履约互保准备金</label></p>
            <span>{protectFee}</span>
          </div>
        </div>
        <div className="row col-cell-group">
          <div className="col-xs-4 col-cell">
            <p><label className="cell-label ">趸缴费用总和</label></p>
            <span>{tjFee}</span>
          </div>
          <div className="col-xs-6 col-cell">
            <p><label className="cell-label ">利率</label></p>
            <span>{this.context.reloanInfo.feeRate && this.context.reloanInfo.feeRate.intRate}%</span>
          </div>
        </div>
        <div className="row col-cell-group">
          <div className="col-xs-4 col-cell">
            <p><label className="cell-label ">申请金额上限</label></p>
            <span>200000</span>
          </div>
          <div className="col-xs-6 col-cell">
            <p><label className="cell-label ">建议期限</label></p>
            <span>{maturity}</span>
          </div>
        </div>
        <div className="row col-cell-group">
          <div className="col-xs-4 col-cell">
            <p><label className="cell-label ">有效日期</label></p>
            <span>{date}</span>
          </div>
        </div>
        <div className="task-step-title" style={{'marginBottom': '15px'}}>
          <h5>用户信息</h5>
        </div>
        <div className="row col-cell-group">
          <div className="col-xs-4 col-cell">
            <p><label className="cell-label ">用户姓名</label></p>
            <span>{this.context.reloanInfo.realName}</span>
          </div>
          <div className="col-xs-6 col-cell">
            <p><label className="cell-label ">身份证号</label></p>
            <span>{this.context.reloanInfo.cardNum}</span>
          </div>
        </div>
        <div className="row col-cell-group">
          <div className="col-xs-4 col-cell">
            <p><label className="cell-label ">原借款申请ID</label></p>
            <span>{this.context.reloanInfo.originalLoanAppId}</span>
          </div>
          <div className="col-xs-6 col-cell">
            <p><label className="cell-label ">原借款ID</label></p>
            <span>{this.context.reloanInfo.originalLoanId}</span>
          </div>
        </div>
        <div className="row col-cell-group">
          <div className="col-xs-4 col-cell">
            <p><label className="cell-label ">客户等级</label></p>
            <span>{this.context.reloanInfo.grade}</span>
          </div>
        </div>
      </div>);
  }
}
export default PreAuthorizeTab;
PreAuthorizeTab.contextTypes = {
  reloanInfo: React.PropTypes.object
};
