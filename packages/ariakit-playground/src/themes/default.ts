import { css } from "@emotion/react";

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

  @media (max-width: 640px) {
    &:focus-within {
      font-size: 16px;
      line-height: 24px;
    }
  }

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
    position: relative;
    align-items: flex-start;
    overflow: auto;
    height: 100%;
    margin: 0;
    z-index: 0;
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

  .cm-content {
    padding: 0;
  }

  code.cm-content {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    /* TODO: Comment about collapsible with end line */
    height: max-content;
  }

  code.cm-content,
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
    color: inherit;
  }

  .cm-lineNumbers {
    position: sticky;
    flex-direction: column;
    flex-shrink: 0;
  }

  .cm-lineNumbers .cm-gutterElement {
    text-align: right;
    padding: 0 16px 0 8px;
    box-sizing: border-box;
    line-height: 21px;
  }

  .cm-foldPlaceholder {
    padding: 2px 6px;
    margin: 0 4px;
    border: none;
  }

  .cm-cursor {
    border-left-width: 2px;
    border-left-style: solid;
    border-left-color: currentColor;
    height: 21px !important;
    transform: translateY(-10%);
  }
`;

export default theme;
