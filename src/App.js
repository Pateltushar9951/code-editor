import React from "react";
import Home from "./Components/Home";
import WebEditor from "./Components/WebEditor";
import MarkdownEditor from "./Components/MarkdownEditor";
import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";
import ForgotPassword from "./Components/Auth/ForgotPassword";
import PrivateRoute from "./Components/Auth/PrivateRoute";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <PrivateRoute path="/web" component={WebEditor} />
        <Route path="/markdown" component={MarkdownEditor} />
      </Switch>
    </Router>
  );
}

export default App;
