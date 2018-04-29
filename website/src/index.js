import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider, styled, Block } from "reas";
import "./globalStyles";
import Home from "./pages/Home";
import Sections from "./pages/Sections";

const Wrapper = styled(Block)`
  font-family: sans-serif;
`;

const App = props => (
  <Provider initialState={{ config: props.config }}>
    <Wrapper>
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/" render={p => <Sections {...props} {...p} />} />
        </Switch>
      </Router>
    </Wrapper>
  </Provider>
);

export default App;
