import { injectGlobal } from "styled-components";
import FiraCodeBold from "./FiraCode-Bold.woff";
import FiraCodeLight from "./FiraCode-Light.woff";
import FiraCodeMedium from "./FiraCode-Medium.woff";
import FiraCodeRegular from "./FiraCode-Regular.woff";

// eslint-disable-next-line no-unused-expressions
injectGlobal`
  @font-face {
    font-family: 'Fira Code';
    src: url(${FiraCodeLight});
    font-weight: 300;
    font-style: normal;
  }
  @font-face {
    font-family: 'Fira Code';
    src: url(${FiraCodeRegular});
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'Fira Code';
    src: url(${FiraCodeMedium});
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: 'Fira Code';
    src: url(${FiraCodeBold});
    font-weight: 700;
    font-style: normal;
  }
`;
