import React, { ComponentType, ComponentClass } from "react";
import { StyledComponentClass } from "styled-components";

export * from "styled-components";

declare module "styled-components" {
  export interface StyledComponentClass<P, T, O = P> {
    target: ComponentType<P>;
  }

  export function isStyledComponent<Props>(
    target: ComponentType<Props> | StyledComponentClass<Props, any>
  ): target is StyledComponentClass<Props, any>;
}
