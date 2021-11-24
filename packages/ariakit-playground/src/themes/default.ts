import { css } from "@emotion/css";

const theme = css`
  margin: 0;
  font-family: Menlo, monospace;
  font-size: 14px;
  line-height: 21px;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  tab-size: 2;
  hyphens: none;

  .cm-editor,
  .cm-gutters,
  .cm-lineNumbers,
  .cm-activeLine,
  .cm-activeLineGutter,
  .cm-scroller {
    background-color: inherit;
  }

  .cm-editor {
    border-radius: inherit;
    max-height: inherit;
    &.cm-focused {
      outline: none;
    }
  }

  pre {
    display: flex;
    overflow: auto;
    margin: 0;
  }

  .cm-scroller {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    max-height: inherit;
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
    /* TODO: Comment about collapsible with end line */
    height: max-content;
  }

  code,
  .cm-line {
    padding: 0 1px;
  }

  .cm-gutters {
    display: flex;
    position: sticky;
    border: none;
    padding-left: 8px;
    z-index: 200;
    left: 0;
    height: 100%;
  }

  .cm-lineNumbers {
    position: sticky;
    flex-direction: column;
  }

  .cm-lineNumbers .cm-gutterElement {
    text-align: right;
    padding: 0 16px 0 8px;
    box-sizing: border-box;
    line-height: 21px;
  }

  .cm-content {
    padding: 0;
  }

  .cm-cursor {
    border-left-width: 2px;
    border-left-style: solid;
    height: 21px !important;
    transform: translateY(-10%);
  }
`;

export default theme;
