/*
  TODO can be deleted when https://github.com/styled-components/styled-components/pull/1827 gets released
*/
declare module "styled-components" {
  import React, { ComponentType } from "react";
  import { StyledComponentClass } from "styled-components";

  export interface StyledComponentClass<P, T, O = P> {
    target: ComponentType<P>;
  }

  export function isStyledComponent<Props>(
    target: ComponentType<Props> | StyledComponentClass<Props, any>
  ): target is StyledComponentClass<Props, any>;
}

declare module "react-known-props" {
  export interface Options {
    legacy: boolean;
  }

  export function getElementProps(tagName: string, options: Options): string[];

  export function getEventProps(): string[];
}

declare module "styled-tools";
