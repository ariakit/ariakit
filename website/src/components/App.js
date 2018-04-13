import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from "../../../src";
import Home from "./Home";

const App = () => (
  <Provider>
    <Router>
      <Route exact path="/" render={Home} />
    </Router>
  </Provider>
);

export default App;
