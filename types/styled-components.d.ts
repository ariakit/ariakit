import React, { ComponentType } from "react";
import { StyledComponentClass } from "styled-components";

declare module "styled-components" {
  /*
    TODO can be deleted when https://github.com/styled-components/styled-components/pull/1827 gets released
  */
  export function isStyledComponent<Props>(
    target: ComponentType<Props> | StyledComponentClass<Props, any>
  ): target is StyledComponentClass<Props, any>;
}
