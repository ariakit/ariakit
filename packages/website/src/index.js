import "@babel/polyfill";
import "parse-prop-types";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from "reakit";
import "./globalStyles";
import themeWebsite from "./theme";
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
  <Provider initialState={getInitialState(props)} devtools theme={themeWebsite}>
    <Router>
      <ScrollToTop>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/" component={Sections} />
        </Switch>
      </ScrollToTop>
    </Router>
  </Provider>
);

export default App;
