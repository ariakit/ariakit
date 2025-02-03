/* @refresh reload */
import { render } from "solid-js/web";

import App from "./App.jsx";

const root = document.getElementById("root");

// @ts-expect-error
if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(() => <App />, root!);
