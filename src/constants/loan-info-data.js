const loanInfoData = {
  'aId': document.getElementById('aId') ? document.getElementById('aId').value : '',
  'loanId': document.getElementById('loanId') ? document.getElementById('loanId').value : '',
  'detailType': document.getElementById('detailType') ? document.getElementById('detailType').value : '',
  'isReadonly': document.getElementById('isReadonly') ? document.getElementById('isReadonly').value : '',
  'loanStatus': document.getElementById('loanStatus') ? document.getElementById('loanStatus').value : '',
  'realLoanId': document.getElementById('realLoanId') ? document.getElementById('realLoanId').value : '',
  'loanAppStatusCode': document.getElementById('loanAppStatusCode') ? document.getElementById('loanAppStatusCode').value : '',
  'configCode': document.getElementById('configCode') ? document.getElementById('configCode').value : '',
  'isNewLoanType': document.getElementById('isNewLoanType') ? document.getElementById('isNewLoanType').value : '',
  'loanType': convertLoanType(),
  'code': convertconfigCode(),
  'taskStatus': document.getElementById('taskStatus') ? document.getElementById('taskStatus').value : '',
  'routingSystem': document.getElementById('routingSystem') ? document.getElementById('routingSystem').value : '',
  'configProductCode': document.getElementById('configProductCode') ? document.getElementById('configProductCode').value : '',
  'userPhone': document.getElementById('userPhone') ? document.getElementById('userPhone').value : null,
  'isPreAuthorize': document.getElementById('isPreAuthorize') ? document.getElementById('isPreAuthorize').value : false,
  'cusName': document.getElementById('cusName') ? document.getElementById('cusName').value : '',
  'ossDownloadMethod': document.getElementById('ossDownloadMethod') ? document.getElementById('ossDownloadMethod').value : ''
};

function convertLoanType() {
  let loanType = document.getElementById('loanType') ? document.getElementById('loanType').value : '';
  let isNewLoanType = document.getElementById('isNewLoanType') ? document.getElementById('isNewLoanType').value : '';
  if(loanType === 'DOUBLE_FUND' && isNewLoanType === 'YES')loanType = 'NEW_DOUBLE_FUND';
  return loanType;
}

function convertconfigCode() {
  let configCode = document.getElementById('configCode') ? document.getElementById('configCode').value : '';
  if(configCode === 'CRM' || configCode === 'LITE') {
    configCode = 'crm_created';
  }else if (configCode === 'MCA_ICRC_TEST') {
    return configCode;
  }else {
    configCode = 'crm';
  }
  return configCode;
}

export default loanInfoData;
