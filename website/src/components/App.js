import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from "../../../src";
import ConfigContext from "./ConfigContext";
import Home from "./Home";

const App = props => (
  <Provider>
    <ConfigContext.Provider value={props.config}>
      <Router>
        <Route exact path="/" render={Home} />
      </Router>
    </ConfigContext.Provider>
  </Provider>
);

export default App;
