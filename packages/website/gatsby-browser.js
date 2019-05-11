import "whatwg-fetch";
import React from "react";
import Provider from "./src/components/Provider";
import CoreLayout from "./src/components/CoreLayout";

export const wrapRootElement = ({ element }) => <Provider>{element}</Provider>;

export const wrapPageElement = ({ element, props }) => {
  return <CoreLayout {...props}>{element}</CoreLayout>;
};
