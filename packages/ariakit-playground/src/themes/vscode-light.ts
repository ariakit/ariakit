import { css } from "@emotion/react";
import defaultTheme from "./default.js";

const foreground = "hsl(204, 3%, 16%)";
const identifier = "hsl(233, 100%, 25%)";
const selection = "hsl(210, 100%, 84%)";
const selectionMatch = "hsl(207, 50%, 85%)";
const matchingBracket = "hsla(204, 3%, 50%, 0.5)";
const lineNumber = "hsl(204, 3%, 43%)";
const activeLine = "hsla(204, 3%, 87%, 0.4)";
const keyword = "hsl(240, 100%, 50%)";
const comment = "hsl(120, 100%, 25%)";
const number = "hsl(158, 87%, 28%)";
const string = "hsl(0, 77%, 36%)";
const func = "hsl(40, 52%, 31%)";
const regex = "hsl(340, 61%, 31%)";
const tag = "hsl(195, 60%, 35%)";
const selector = "hsl(0, 100%, 25%)";

const theme = css`
  ${defaultTheme}
  color: ${foreground};

  .cm-scroller {
    scrollbar-color: rgba(0, 0, 0, 0.6) transparent;
    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.3);
      &:hover {
        background-color: rgba(0, 0, 0, 0.6);
      }
    }
  }

  &.code-css pre,
  &.code-js pre,
  &.code-jsx pre,
  &.code-ts pre,
  &.code-tsx pre {
    color: ${identifier};
  }

  .cm-selectionBackground,
  .cm-focused .cm-selectionBackground,
  &::selection,
  *::selection {
    background-color: ${selection};
  }

  .cm-selectionMatch {
    background-color: ${selectionMatch};
  }

  .cm-lineNumbers .cm-gutterElement {
    color: ${lineNumber};
  }

  .cm-cursor {
    border-left-color: ${foreground};
  }

  .cm-focused .cm-activeLine {
    background-color: ${activeLine};
  }

  .cm-focused .cm-activeLineGutter {
    color: ${foreground};
    background-color: ${activeLine};
  }

  .cm-matchingBracket,
  .cm-nonmatchingBracket {
    background-color: ${selectionMatch};
    outline: 1px solid ${matchingBracket};
  }

  .token.keyword,
  .token.boolean,
  .token.important,
  .token.entity,
  .token.atrule,
  .token.atrule .token.rule,
  .token.punctuation.interpolation-punctuation {
    color: ${keyword};
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
    color: ${identifier};
  }

  .token.comment {
    color: ${comment};
    font-style: italic;
  }

  .token.punctuation,
  .token.plain-text,
  .token.operator,
  .token.entity,
  .token.atrule .token.keyword,
  .token.attr-value .token.punctuation.attr-equals,
  .token.tag .script .token.punctuation {
    color: ${foreground};
  }

  .token.boolean,
  .token.number,
  .token.symbol,
  .token.inserted,
  .token.unit {
    color: ${number};
  }

  .token.string,
  .token.char,
  .token.deleted,
  .token.attr-value,
  .token.attr-value .token.punctuation {
    color: ${string};
  }

  .token.function {
    color: ${func};
  }

  .token.regex {
    color: ${regex};
  }

  .token.tag,
  .token.builtin,
  .token.namespace,
  .token.class-name,
  .token.class-name .token.constant {
    color: ${tag};
  }

  .token.angle-bracket,
  .token.tag .token.punctuation {
    color: ${lineNumber};
  }

  &.code-html .token.doctype .token.name {
    color: ${tag};
  }

  &.code-html .token.tag {
    color: ${foreground};
  }

  &.code-css .token.function {
    color: ${keyword};
  }

  &.code-css .token.selector,
  &.code-css .token.square-bracket + .token.property-name,
  &.code-css .token.square-bracket + .token.property-name,
  &.code-css .token.class-name {
    color: ${selector};
  }
`;

export default theme;
