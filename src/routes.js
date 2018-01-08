import React,  { Component }  from 'react';
import { Router, Route} from 'react-router';
import App from './components/App';

class Routers extends Component {
  render() {
    return (
      <Router {...this.props}>
        <Route path="/" component={App}/>
      </Router>
    );
  }
}

export default Routers;
