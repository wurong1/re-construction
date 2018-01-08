import { render } from 'react-dom';
import React from 'react';
import { useRouterHistory } from 'react-router';
import { createHashHistory } from 'history';
import Root from '../containers/Root';
import createStore from '../store/configureStore';
import Menu from '../components/menu';
import './theme.less';
import '../components/app.less';

const appHistory = useRouterHistory(createHashHistory)({ queryKey: false });
const store = createStore({});
if(document.getElementById('app')) {
  render(
    <Root store={store} history={appHistory}/>,
    document.getElementById('app')
  );
}
if(document.getElementById('new_menu')) {
  render(
    <Menu />,
    document.getElementById('new_menu')
  );
}
