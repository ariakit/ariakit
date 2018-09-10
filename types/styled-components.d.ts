import { ComponentType, ReactNode, ReactElement } from "react";

export * from "styled-components";

declare module "styled-components" {
  export interface StyledComponentClass<P, T, O = P> {
    (props: P & { children?: ReactNode }, context?: any): ReactElement<
      any
    > | null;
    target: ComponentType<P>;
    styledComponentId: string;
  }
}
