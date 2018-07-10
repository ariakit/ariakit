import "babel-polyfill";
import "parse-prop-types";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider, Provider } from "reakit";
import "./globalStyles";
import theme from "./theme";
import getEvalInContext from "./utils/getEvalInContext";
import parseSections from "./utils/parseSections";
import Home from "./pages/Home";
import Sections from "./pages/Sections";
import ScrollToTop from "./components/ScrollToTop";

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
      <Router>
        <ScrollToTop>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/" component={Sections} />
          </Switch>
        </ScrollToTop>
      </Router>
    </ThemeProvider>
  </Provider>
);

export default App;
