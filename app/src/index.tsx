import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ProtectedRoute from "./components/ProtectedRoute";
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import Restore from './pages/auth/Restore';
import App from './pages/app/App';

ReactDOM.render(
      <Router>
      <Switch>
        <Route path="/signup" component={Register} />
        <Route path="/signin" component={Login} />
        <Route path="/restore" component={Restore} />
        <ProtectedRoute path="/" component={App} />
      </Switch>
    </Router>,
  document.getElementById('root')
);
