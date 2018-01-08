import React, { Component } from 'react';
import { Menu, Icon, Dropdown, Spin, message} from 'antd';
import { remote } from '../../utils/fetch';
import createIO from './im-socket';
import './menu.less';

const { SubMenu } = Menu;
const MenuItemGroup = Menu.ItemGroup;

class TopMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      info: {},
      callVendor: {},
      unReceivedCount: {
        hold: 0,
        approved: 0,
      },
      isFetching: false,
    };
  }
  componentDidMount() {
    //获取菜单数据
    remote({
      method: 'GET',
      url: '/borrower/v1/auth/me/navlinks'
    }).then((data) => {
      if(data && data.code!==0 ) {
        message.error(data.message);
        return false;
      };
      this.setState({data: data.data || []});
    }).catch(() => {

    });
    // 初始化socket
    this.setState({isFetching: true});
    remote({
      method: 'GET',
      url: '/borrower/v1/auth/me'
    }).then((res) => {
      this.setState({info: res.data || {} });
      if(res && res.code!==0 ) {
        message.error(res.message);
        this.setState({isFetching: false});
        return false;
      };
      const { id = '' } = res && res.data;
      remote({
        method: 'GET',
        url: `/borrower/v1/notify/getOrCreateImCustomer?employeeId=${id}`
      }).then((res) => {
        if(res && res.code!==0 ) {
          message.error(res.message);
          this.setState({isFetching: false});
          return false;
        };
        const imId = res && res.data;
        remote({
          method: 'GET',
          url: `/borrower/v1/notify/getUnReadMsgCount?userId=${imId || ''}`
        }).then((res) => {
          if(res && res.code!==0 ) {
            message.error(res.message);
            this.setState({isFetching: false});
            return false;
          };
          this.setState({unReceivedCount: res && res.data && res.data.unReceivedMessageCount })
          remote({
            method: 'GET',
            url: '/saas/im/getConnector'
          }).then((res) => {
            this.setState({isFetching: false});
            if(res && res.code!==0 ) {
              message.error(res.message);
              return false;
            };
            const url = res && res.data; 
            createIO({ to: imId })(url)
            .then(socket => {
              socket.on('msg', (res)=>{
                console.log('msg',res);
                remote({
                  method: 'GET',
                  url:`/borrower/v1/notify/getUnReadMsgCount?userId=${imId}`}).then((res) => {
                    if(res && res.code!==0 ) {
                      message.error(res.message);
                      return false;
                    };
                    this.setState({unReceivedCount: res && res.data && res.data.unReceivedMessageCount })
                 })
              });
            })
          }).catch(() => {
            this.setState({isFetching: false});
          });
        }).catch(() => {
          this.setState({isFetching: false});
        });
      }).catch(() => {
        this.setState({isFetching: false});
      });
    }).catch(() => {
      this.setState({isFetching: false});
    });
    //获取坐席信息
    remote({
      method: 'GET',
      url: '/borrower/v1/auth/me/preferredline'
    }).then((data) => {
      if(data && data.code!==0 ) {
        message.error(data.message);
        return false;
      };
      this.setState({callVendor:data.data || {} })
    }).catch(() => {
    
    });
  }

  handleClick = e => {
    console.log(e)
  }

  handleChange = e => {
    console.log(e)
  }

  getLink = (link) => {
    const path = link.split('/')[2];
    const icsUrlObj = {
      myTicket: '/ics/ticket.html#/tickets/SINGLE?origin=1',
      allTicket: '/ics/ticket.html#/tickets/ALL?origin=1',
    };
    const newLinkArray = [
      'myCustomers',
      'allCustomers',
      'reAudit',
      'createLoan',
      'taskStatistics',
      'loan_application_report',
      'loan_repayment_report',
      'notification',
      'notifiySetting',
      'assignActorRuleConfig',
      'assignActorTaskStatusConfig',
      'borrowerLoanInfo',
      'unionPay',
      'toAddborrowcustomer',
      'toUploadFialedList',
      'myTasks',
      'teamTasks',
      'undistributed-customer',
      'no-sales-tasks',
      'notice',
      'knowledge',
      'collection',
      'sortManage',
      'callrecords',
      'records',
      'article-add',
      'call-record-report',
      'tellphone-statistics-report',
      'sms-my-record',
      'sms-all-record',
      'sms-template',
      'sms-send',
      'cms-group',
      'task-delay',
      'assign-report',
    ];
    const icsLinkArray = [
      'myTicket',
      'allTicket',
    ];
    const isNew = newLinkArray.includes(path);
    const isIcs = icsLinkArray.includes(path);
    const url = isNew ? '/bcrm/#' + path : isIcs ? icsUrlObj[path] : link;
    return url;
  }

  render() {
    const { info, callVendor, unReceivedCount:{ approved=0, hold=0 }, isFetching} = this.state;
    const totalCount = approved + hold;
    const menu = (
      <Menu>
        <Menu.Item>
          <span className="header-dropdown">工号: &nbsp;{callVendor.agentNo} </span>
        </Menu.Item>
        <Menu.Item>
          <a className="header-dropdown" href="/logout/cas"> 安全退出</a>
        </Menu.Item>
      </Menu>
    )
    return (
      <div className="new-menu">
        <div className="new-logo">
        </div>
            <div className="msg">
              <a href='/bcrm/#/notification'>
              <Spin spinning={isFetching}>
                <span>消息</span>
                { totalCount > 0 ? <div className="msg-num">{totalCount}</div>: ''}
              </Spin>
              </a>  
            </div>
        <div className="new-header-tool">
          <Dropdown overlay={menu} placement="bottomRight">
            <div title={info.name}>
             {info.name && info.name.length > 5 ? `${info.name.substr(0, 5)}...` : info.name} 
              <Icon type="down" />
            </div>
          </Dropdown>
        </div>
        <Menu
          onClick={this.handleClick}
          selectedKeys={[location.pathname]}
          mode="horizontal" >
          {
            this.state.data.map(item =>
              {
               return item.children.length > 0 ?
                  <SubMenu title={item.label.replace(/管理$/, '')} key={item.id}>
                    {
                      item.children.map((child) => {
                        const { children } = child;
                        let dom = null;
                        if (children.length > 0) {
                          dom = (
                            <MenuItemGroup title={child.label} key={child.id}>
                              {
                                children.map((i) => {
                                  return (
                                    <Menu.Item key={i.link}>
                                      <a href={this.getLink(i.link)}>{i.label}</a>
                                    </Menu.Item>
                                  );
                                })
                              }
                            </MenuItemGroup>
                          );
                        } else {
                          dom = (
                            <Menu.Item key={child.link}>
                              <a href={this.getLink(child.link)}>{child.label}</a>
                            </Menu.Item>
                          );
                        }
                        return dom;
                      })
                    }
                  </SubMenu> :
                  <Menu.Item key={item.link}>
                    <a href={this.getLink(item.link)}>{item.label}</a>
                  </Menu.Item>
              }
            )
          }
        </Menu>
      </div>
    );
  }
}

export default TopMenu;