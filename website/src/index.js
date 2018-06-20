import "babel-polyfill";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider, Provider, styled, Block } from "reakit";
import "./globalStyles";
import theme from "./theme";
import getEvalInContext from "./utils/getEvalInContext";
import parseSections from "./utils/parseSections";
import Home from "./pages/Home";
import Sections from "./pages/Sections";

const Wrapper = styled(Block)`
  font-family: "Source Sans Pro", sans-serif;
  -webkit-font-smoothing: antialiased;
`;

const getInitialState = ({ allSections, ...props }) => ({
  styleguidist: {
    ...props,
    sections: parseSections(allSections),
    evalInContext: getEvalInContext(props)
  }
});

const App = props => (
  <Provider initialState={getInitialState(props)} devtools>
    <ThemeProvider theme={theme}>
      <Wrapper>
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/" component={Sections} />
          </Switch>
        </Router>
      </Wrapper>
    </ThemeProvider>
  </Provider>
);

export default App;
