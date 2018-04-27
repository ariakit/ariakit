import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider, styled, Block } from "reas";
import ConfigContext from "../ConfigContext";
import "./globalStyles";
import Home from "../Home";
import Sections from "../Sections";

const Wrapper = styled(Block)`
  font-family: sans-serif;
`;

const App = props => (
  <Provider>
    <ConfigContext.Provider value={props.config}>
      <Wrapper>
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/" render={p => <Sections {...props} {...p} />} />
          </Switch>
        </Router>
      </Wrapper>
    </ConfigContext.Provider>
  </Provider>
);

export default App;
