import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider, Block } from "reas";
import ConfigContext from "../ConfigContext";
import Home from "../Home";
import "./globalStyles";

const Wrapper = Block.extend`
  font-family: sans-serif;
`;

const App = props => (
  <Provider>
    <ConfigContext.Provider value={props.config}>
      <Wrapper>
        <Router>
          <Route exact path="/" render={Home} />
        </Router>
      </Wrapper>
    </ConfigContext.Provider>
  </Provider>
);

export default App;
