import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { getExtension } from "./get-extension.js";

export function getLanguage(file: string) {
  const extension = getExtension(file);
  switch (extension) {
    case "js":
    case "jsx":
      return javascript({ jsx: true });
    case "ts":
    case "tsx":
      return javascript({ jsx: true, typescript: true });
    case "css":
      return css();
    case "json":
      return json();
  }
  return null;
}
