import React from "react";
import { renderToString } from "react-dom/server";
import { renderStylesToString } from "emotion-server";
import Provider from "./src/components/Provider";
import CoreLayout from "./src/components/CoreLayout";

export const replaceRenderer = ({ bodyComponent, replaceBodyHTMLString }) => {
  const html = renderStylesToString(renderToString(bodyComponent));
  replaceBodyHTMLString(html);
};

export const wrapRootElement = ({ element }) => <Provider>{element}</Provider>;

export const wrapPageElement = ({ element, props }) => {
  return <CoreLayout {...props}>{element}</CoreLayout>;
};
