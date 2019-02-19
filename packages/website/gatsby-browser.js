/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// You can delete this file if you're not using it
import React from "react";
import { setConfig } from "react-hot-loader";
import App from "./src/App";

setConfig({ pureSFC: true });

export function wrapRootElement({ element }) {
  return <App>{element}</App>;
}
