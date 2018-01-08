import React from 'react';
import { connect } from 'react-redux';
import './loading.less';

class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShown: false
    };
  }

  show() {
    this.setState({
      isShown: true
    });
  }

  hide() {
    this.setState({
      isShown: false
    });
  }

  render() {
    if (this.props.loading) {
      return (
        <div className="block-loading" >
          <div className="block-loading-icon"></div>
        </div>
      );
    }
    return <div></div>;
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.loading.loading
  };
};

export default connect(mapStateToProps, {})(Loading);
