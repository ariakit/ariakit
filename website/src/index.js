import "babel-polyfill";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider, Provider, styled, Block } from "reakit";
import "./globalStyles";
import theme from "./theme";
import Home from "./pages/Home";
import Sections from "./pages/Sections";
import getEvalInContext from "./utils/getEvalInContext";

const Wrapper = styled(Block)`
  font-family: "Source Sans Pro", sans-serif;
  -webkit-font-smoothing: antialiased;
`;

const getInitialState = props => ({
  config: {
    ...props.config,
    evalInContext: getEvalInContext(props)
  }
});

const App = props => (
  <Provider initialState={getInitialState(props)} devtools>
    <ThemeProvider theme={theme}>
      <Wrapper>
        <Router>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/" render={p => <Sections {...props} {...p} />} />
          </Switch>
        </Router>
      </Wrapper>
    </ThemeProvider>
  </Provider>
);

export default App;
