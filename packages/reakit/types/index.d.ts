declare module "react-known-props" {
  export interface Options {
    legacy: boolean;
  }

  export function getElementProps(tagName: string, options: Options): string[];

  export function getEventProps(): string[];
}

declare module "styled-tools";
