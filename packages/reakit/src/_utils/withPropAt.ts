import { ifProp, prop, withProp } from "styled-tools";
import { css } from "../styled";

export default function withPropAt(propName: string) {
  return (pass: any, fail?: any) =>
    ifProp(
      propName,
      css`
        @media (min-width: ${withProp(propName, x => x + 1)}px) {
          ${fail};
        }
        @media (max-width: ${prop(propName)}px) {
          ${pass};
        }
      `,
      fail
    );
}
