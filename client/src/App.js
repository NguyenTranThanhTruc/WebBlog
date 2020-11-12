import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Landing from './components/layout/Landing.jsx';
import Register from './components/auth/Register.jsx';
import Login from './components/auth/Login.jsx';
import Alert from './components/layout/Alert';
// Redux
import { Provider } from 'react-redux';
import store from './store';

import './App.css';

const App = () => (
  <Provider store={store}>
    <Router>
      <Fragment>
        <Navbar />
        <Route exact path='/' component={Landing} />
        <section className="container">
          <Alert/>
          <switch>
            <Route exact path='/register' component={Register} />
            <Route exact path='/login' component={Login} />
          </switch>
        </section>
      </Fragment>
    </Router>
  </Provider>

);

export default App;
