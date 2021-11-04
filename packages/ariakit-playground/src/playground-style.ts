import { css } from "@emotion/css";

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

export const playgroundCodeStyle = css`
  margin: 0;
  color: ${white};
  font-family: Menlo, monospace;
  font-size: 14px;
  line-height: 21px;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  tab-size: 2;
  hyphens: none;
  /* TODO: Accept border-radius from outside? */
  /* border-radius: 8px; */

  .cm-editor {
    border-radius: inherit;
    max-height: inherit;
  }

  pre {
    display: flex;
    overflow: auto;
    margin: 0;
  }

  &.code-css pre,
  &.code-js pre,
  &.code-jsx pre,
  &.code-ts pre,
  &.code-tsx pre {
    color: ${lightBlue};
  }

  .cm-scroller {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    max-height: inherit;
    background: ${black};
    border-radius: inherit;
    padding: 16px 8px 16px 0;
    box-sizing: border-box;
  }

  &:not(.has-line-numbers) .cm-scroller {
    padding: 16px;
  }

  code {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    /* Comment: collapsible with end line */
    height: max-content;
  }

  .cm-selectionBackground,
  .cm-focused .cm-selectionBackground,
  &::selection,
  *::selection {
    background-color: ${dimmedBlue};
  }

  code,
  .cm-line {
    padding: 0 1px;
  }

  .cm-gutters {
    display: flex;
    position: sticky;
    background-color: ${black};
    border: none;
    padding-left: 8px;
    z-index: 200;
    left: 0;
    height: 100%;
  }

  .cm-lineNumbers {
    background-color: ${black};
    position: sticky;
    flex-direction: column;
  }

  .cm-lineNumbers .cm-gutterElement {
    color: ${gray};
    text-align: right;
    padding: 0 16px 0 8px;
    box-sizing: border-box;
    line-height: 21px;
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

export const playgroundEditorStyle = css`
  ${playgroundCodeStyle}

  .cm-focused {
    outline: none;
  }

  .cm-content {
    padding: 0;
  }

  .cm-cursor {
    border-left: 2px solid ${white};
    height: 21px !important;
    transform: translateY(-10%);
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
`;
