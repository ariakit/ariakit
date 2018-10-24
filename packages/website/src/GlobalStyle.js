import { createGlobalStyle } from "reakit";
import FiraCodeBold from "./fonts/FiraCode-Bold.woff";
import FiraCodeLight from "./fonts/FiraCode-Light.woff";
import FiraCodeMedium from "./fonts/FiraCode-Medium.woff";
import FiraCodeRegular from "./fonts/FiraCode-Regular.woff";

// eslint-disable-next-line no-unused-expressions
const GlobalStyle = createGlobalStyle`
  body {
    font-family: "Source Sans Pro", sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  @font-face {
    font-family: "Fira Code";
    src: url(${FiraCodeLight});
    font-weight: 300;
    font-style: normal;
  }
  @font-face {
    font-family: "Fira Code";
    src: url(${FiraCodeRegular});
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: "Fira Code";
    src: url(${FiraCodeMedium});
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: "Fira Code";
    src: url(${FiraCodeBold});
    font-weight: 700;
    font-style: normal;
  }
`;

export default GlobalStyle;
