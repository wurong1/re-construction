import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import Routers from '../routes';
import Loading from '../components/loading/loading';

class Root extends Component {
  render() {
    let { store, history } = this.props;
    return (
      <Provider store={store}>
        <div>
          <Routers history={history} />
          <Loading />
        </div>
      </Provider>
    );
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default Root;
