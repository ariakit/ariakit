import "@babel/polyfill";
import "parse-prop-types";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider, ThemeProvider } from "reakit";
import GlobalStyle from "./GlobalStyle";
import getEvalInContext from "./utils/getEvalInContext";
import parseSections from "./utils/parseSections";
import lightTheme from "./theme/light";
import darkTheme from "./theme/dark";
import Home from "./pages/Home";
import Sections from "./pages/Sections";
import ScrollToTop from "./components/ScrollToTop";
import ThemeContainer from "./containers/ThemeContainer";

const getInitialState = ({ allSections, ...props }) => ({
  styleguidist: {
    ...props,
    sections: parseSections(allSections),
    evalInContext: getEvalInContext(props)
  }
});

const App = props => (
  <Provider initialState={getInitialState(props)} devtools>
    <ThemeContainer>
      {({ mode }) => (
        <ThemeProvider theme={mode === "dark" ? darkTheme : lightTheme}>
          <React.Fragment>
            <GlobalStyle />
            <Router>
              <ScrollToTop>
                <Switch>
                  <Route exact path="/" component={Home} />
                  <Route path="/" component={Sections} />
                </Switch>
              </ScrollToTop>
            </Router>
          </React.Fragment>
        </ThemeProvider>
      )}
    </ThemeContainer>
  </Provider>
);

export default App;
