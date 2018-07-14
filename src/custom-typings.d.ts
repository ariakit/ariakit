/*
  This file is to fix a missing type from styled-components.
  It can be deleted when https://github.com/styled-components/styled-components/pull/1827 gets released
*/
import * as React from "react";
import { Component } from "react";

declare module "styled-components" {
   export function isStyledComponent(target: string | Component<object>): boolean;
}