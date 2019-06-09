// @ts-ignore
import raw from "raw.macro";
import { css, cx, injectGlobal } from "emotion";
import { usePalette, useFade, useContrast } from "reakit-system-palette/utils";
import { ErrorMessageOptions, ErrorMessageHTMLProps } from "./ErrorMessage";
import {
  PlaygroundEditorOptions,
  PlaygroundEditorHTMLProps
} from "./PlaygroundEditor";
import {
  PlaygroundPreviewOptions,
  PlaygroundPreviewHTMLProps
} from "./PlaygroundPreview";

const baseStyles = raw("codemirror/lib/codemirror.css");

injectGlobal`
  ${baseStyles}
  /* SCROLL */
  .CodeMirror-overlayscroll .CodeMirror-scrollbar-filler,
  .CodeMirror-overlayscroll .CodeMirror-gutter-filler {
    display: none !important;
  }

  .CodeMirror-overlayscroll-horizontal div,
  .CodeMirror-overlayscroll-vertical div {
    position: absolute;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 3px;
  }

  .CodeMirror-overlayscroll-horizontal,
  .CodeMirror-overlayscroll-vertical {
    position: absolute;
    z-index: 6;
  }

  .CodeMirror-overlayscroll-horizontal {
    bottom: 0;
    left: 0;
    height: 6px;
  }
  .CodeMirror-overlayscroll-horizontal div {
    bottom: 0;
    height: 100%;
  }

  .CodeMirror-overlayscroll-vertical {
    right: 0;
    top: 0;
    width: 6px;
  }
  .CodeMirror-overlayscroll-vertical div {
    right: 0;
    width: 100%;
  }

  /* THEME */
  .cm-s-reakit.CodeMirror,
  .cm-s-reakit .CodeMirror-gutters {
    background-color: #282a36 !important;
    color: #f8f8f2 !important;
    border: none;
    z-index: 0;
    border-radius: 0.25em;
    height: auto;
  }
  .cm-s-reakit .CodeMirror-lines {
    padding: 1em 0;
  }
  .cm-s-reakit .CodeMirror-lines pre {
    padding: 0 1.5em;
  }
  .cm-s-reakit .CodeMirror-gutters {
    color: #282a36;
  }
  .cm-s-reakit .CodeMirror-cursor {
    border-left: solid thin #f8f8f0;
  }
  .cm-s-reakit .CodeMirror-linenumber {
    color: #6d8a88;
  }
  .cm-s-reakit .CodeMirror-selected {
    background: rgba(255, 255, 255, 0.2);
  }
  .cm-s-reakit .CodeMirror-line::selection,
  .cm-s-reakit .CodeMirror-line > span::selection,
  .cm-s-reakit .CodeMirror-line > span > span::selection {
    background: rgba(255, 255, 255, 0.2);
  }
  .cm-s-reakit .CodeMirror-line::-moz-selection,
  .cm-s-reakit .CodeMirror-line > span::-moz-selection,
  .cm-s-reakit .CodeMirror-line > span > span::-moz-selection {
    background: rgba(255, 255, 255, 0.2);
  }
  .cm-s-reakit span.cm-comment {
    color: #6272a4;
  }
  .cm-s-reakit span.cm-string,
  .cm-s-reakit span.cm-string-2 {
    color: #f1fa8c;
  }
  .cm-s-reakit span.cm-number {
    color: #bd93f9;
  }
  .cm-s-reakit span.cm-variable {
    color: #50fa7b;
  }
  .cm-s-reakit span.cm-variable-2 {
    color: white;
  }
  .cm-s-reakit span.cm-def {
    color: #50fa7b;
  }
  .cm-s-reakit span.cm-operator {
    color: #ff79c6;
  }
  .cm-s-reakit span.cm-keyword {
    color: #ff79c6;
  }
  .cm-s-reakit span.cm-atom {
    color: #bd93f9;
  }
  .cm-s-reakit span.cm-meta {
    color: #f8f8f2;
  }
  .cm-s-reakit span.cm-tag {
    color: #ff79c6;
  }
  .cm-s-reakit span.cm-attribute {
    color: #50fa7b;
  }
  .cm-s-reakit span.cm-qualifier {
    color: #50fa7b;
  }
  .cm-s-reakit span.cm-property {
    color: #66d9ef;
  }
  .cm-s-reakit span.cm-builtin {
    color: #50fa7b;
  }
  .cm-s-reakit span.cm-variable-3,
  .cm-s-reakit span.cm-type {
    color: #ffb86c;
  }

  .cm-s-reakit .CodeMirror-activeline-background {
    background: transparent;
  }
  .cm-s-reakit.CodeMirror-focused .CodeMirror-activeline-background {
    background: rgba(255, 255, 255, 0.1);
  }
  .cm-s-reakit .CodeMirror-matchingbracket {
    text-decoration: underline;
    color: white !important;
  }
`;

export function useErrorMessageProps(
  _: ErrorMessageOptions,
  htmlProps: ErrorMessageHTMLProps
): ErrorMessageHTMLProps {
  const danger = usePalette("danger") || "red";
  const errorMessage = css`
    color: ${danger};
  `;
  return { ...htmlProps, className: cx(errorMessage, htmlProps.className) };
}

export function usePlaygroundEditorProps(
  options: PlaygroundEditorOptions,
  htmlProps: PlaygroundEditorHTMLProps
): PlaygroundEditorHTMLProps {
  const primary = usePalette("primary") || "blue";
  const contrast = useContrast(primary);
  const maxHeight = options.maxHeight ? options.maxHeight : "auto";
  const playgroundEditor = css`
    margin: 2em 0;
    font-family: Consolas, Liberation Mono, Menlo, Courier, monospace;
    font-size: 0.9375em;
    pre& {
      background-color: #282a36 !important;
      color: #f8f8f2 !important;
      border-radius: 0.25em;
      padding: 1em 1.5em;
      max-height: ${maxHeight};
      overflow: auto;
      box-sizing: border-box;
    }
    .CodeMirror {
      font-family: Consolas, Liberation Mono, Menlo, Courier, monospace;
    }
    .CodeMirror-scroll {
      max-height: ${maxHeight};
      -webkit-overflow-scrolling: touch;
    }
    &.disabled:focus-within {
      position: relative;
      &:before {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        box-shadow: inset 0 0 0 0.2em ${primary};
        z-index: 2;
        border-radius: 0.25em;
        pointer-events: none;
      }
      &:after {
        content: "Press Enter or Space to edit";
        color: ${contrast};
        background-color: ${primary};
        position: absolute;
        top: 0;
        right: 0;
        padding: 0.5em 1em;
        border-radius: 0.25em;
      }
    }
    ${options.readOnly &&
      css`
        .CodeMirror-lines {
          cursor: auto;
        }
        .CodeMirror-cursors {
          display: none;
        }
      `}
  `;
  return { ...htmlProps, className: cx(playgroundEditor, htmlProps.className) };
}

export function usePlaygroundPreviewProps(
  _: PlaygroundPreviewOptions,
  htmlProps: PlaygroundPreviewHTMLProps
): PlaygroundPreviewHTMLProps {
  const foreground = usePalette("foreground") || "black";
  const borderColor = useFade(foreground, 0.85);
  const playgroundPreview = css`
    margin: 2em 0 -1.5em 0;
    padding: 1em;
    border: 1px solid ${borderColor};
    border-radius: 0.25em;
  `;
  return {
    ...htmlProps,
    className: cx(playgroundPreview, htmlProps.className)
  };
}
