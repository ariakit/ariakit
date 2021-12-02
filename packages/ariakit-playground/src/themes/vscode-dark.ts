import { css } from "@emotion/css";
import defaultTheme from "./default";

const foreground = "hsl(204, 3%, 98%)";
const identifier = "hsl(204, 98%, 80%)";
const selection = "hsl(210, 52%, 31%)";
const selectionMatch = "hsl(210, 12%, 22%)";
const matchingBracket = "hsla(204, 3%, 80%, 0.5)";
const lineNumber = "hsl(204, 3%, 50%)";
const activeLine = "hsla(204, 3%, 20%, 0.4)";
const keyword = "hsl(207, 65%, 59%)";
const comment = "hsl(101, 33%, 47%)";
const number = "hsl(99, 28%, 73%)";
const string = "hsl(17, 60%, 64%)";
const func = "hsl(60, 42%, 76%)";
const regex = "hsl(0, 60%, 62%)";
const tag = "hsl(168, 60%, 55%)";
const selector = "hsl(41, 60%, 67%)";

const theme = css`
  ${defaultTheme}
  color: ${foreground};

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

  .cm-matchingBracket,
  .cm-nonmatchingBracket {
    background-color: ${selectionMatch};
    outline: 1px solid ${matchingBracket};
  }

  .cm-focused .cm-activeLine {
    background-color: ${activeLine};
  }

  .cm-focused .cm-activeLineGutter {
    color: ${foreground};
    background-color: ${activeLine};
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
    color: ${foreground};
  }

  &.code-html .token.tag {
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
