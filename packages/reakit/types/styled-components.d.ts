import { ComponentType } from "react";

export * from "styled-components";

declare module "styled-components" {
  export interface StyledComponentClass<P, T, O = P> {
    target: ComponentType<P>;
    styledComponentId: string;
  }

  export function isStyledComponent<Props>(
    target: ComponentType<Props> | StyledComponentClass<Props, any>
  ): target is StyledComponentClass<Props, any>;
}
