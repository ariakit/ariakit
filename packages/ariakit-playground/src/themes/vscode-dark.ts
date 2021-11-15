import { css } from "@emotion/css";
import defaultTheme from "./default";

const black = "#1e1e1e";
const darkGray = "#2b2c2d";
const gray = "#808080";
const white = "#d4d4d4";
const green = "#6a9955";
const lightGreen = "#b5cea8";
const aquaGreen = "#4ec9b0";
const red = "#d16969";
const orange = "#ce9178";
const lightOrange = "#d7ba7d";
const yellow = "#dcdcaa";
const blue = "#569cd6";
const lightBlue = "#9cdcfe";
const dimmedBlue = "#264f78";
const lightDimmedBlue = "#323a40";

const theme = css`
  ${defaultTheme}
  color: ${white};

  &.code-css pre,
  &.code-js pre,
  &.code-jsx pre,
  &.code-ts pre,
  &.code-tsx pre {
    color: ${lightBlue};
  }

  .cm-scroller {
    background: ${black};
  }

  .cm-selectionBackground,
  .cm-focused .cm-selectionBackground,
  &::selection,
  *::selection {
    background-color: ${dimmedBlue};
  }

  .cm-gutters {
    background-color: ${black};
  }

  .cm-lineNumbers {
    background-color: ${black};
  }

  .cm-lineNumbers .cm-gutterElement {
    color: ${gray};
  }

  .cm-cursor {
    border-left-color: ${white};
  }

  .cm-activeLine {
    background-color: ${black};
  }

  .cm-focused .cm-activeLine {
    background-color: ${darkGray};
  }

  .cm-selectionMatch {
    background-color: ${lightDimmedBlue};
  }

  .cm-matchingBracket,
  .cm-nonmatchingBracket {
    background-color: transparent;
    outline: 1px solid ${gray};
  }

  .cm-activeLineGutter {
    background-color: ${black};
  }

  .cm-focused .cm-activeLineGutter {
    color: ${white};
    background-color: ${darkGray};
  }

  .token.keyword,
  .token.boolean,
  .token.important,
  .token.entity,
  .token.atrule,
  .token.atrule .token.rule,
  .token.punctuation.interpolation-punctuation {
    color: ${blue};
  }

  .token.property-name,
  .token.property,
  .token.variable,
  .token.name,
  .token.constant,
  .token.console,
  .token.parameter,
  .token.interpolation,
  .token.attr-name,
  .token.function-variable.function,
  .token.tag .token.script.language-javascript {
    color: ${lightBlue};
  }

  .token.comment {
    color: ${green};
    font-style: italic;
  }

  .token.punctuation,
  .token.plain-text,
  .token.operator,
  .token.entity,
  .token.atrule .token.keyword,
  .token.attr-value .token.punctuation.attr-equals,
  .token.tag .script .token.punctuation {
    color: ${white};
  }

  .token.boolean,
  .token.number,
  .token.symbol,
  .token.inserted,
  .token.unit {
    color: ${lightGreen};
  }

  .token.string,
  .token.char,
  .token.deleted,
  .token.attr-value,
  .token.attr-value .token.punctuation {
    color: ${orange};
  }

  .token.function {
    color: ${yellow};
  }

  .token.regex {
    color: ${red};
  }

  .token.tag,
  .token.builtin,
  .token.namespace,
  .token.class-name,
  .token.class-name .token.constant {
    color: ${aquaGreen};
  }

  .token.angle-bracket,
  .token.tag .token.punctuation {
    color: ${gray};
  }

  &.code-html .token.doctype .token.name {
    color: ${white};
  }

  &.code-html .token.tag {
    color: ${blue};
  }

  &.code-css .token.selector,
  &.code-css .token.square-bracket + .token.property-name,
  &.code-css .token.square-bracket + .token.property-name,
  &.code-css .token.class-name {
    color: ${lightOrange};
  }
`;

export default theme;
