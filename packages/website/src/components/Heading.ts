import { css, cx } from "emotion";
import { useRole, RoleHTMLProps, RoleOptions } from "reakit";
import { createHook, createComponent } from "reakit-system";

export type HeadingOptions = RoleOptions;
export type HeadingHTMLProps = RoleHTMLProps;
export type HeadingProps = HeadingOptions & HeadingHTMLProps;

export const useHeading = createHook<HeadingOptions, HeadingHTMLProps>({
  name: "Heading",
  compose: useRole,

  useProps(_, htmlProps) {
    const heading = css`
      line-height: 1.5;
      & > .anchor:focus > *,
      &:hover > .anchor > * {
        visibility: visible;
      }
      & > .anchor > * {
        visibility: hidden;
      }
      h1& {
        font-size: 2.5em;
        @media (max-width: 768px) {
          font-size: 2em;
        }
      }
      h2& {
        font-size: 2em;
        @media (max-width: 768px) {
          font-size: 1.75em;
        }
      }
      h3& {
        font-size: 1.5em;
        @media (max-width: 768px) {
          font-size: 1.25em;
        }
      }
      h4& {
        font-size: 1.25em;
        @media (max-width: 768px) {
          font-size: 1em;
        }
      }
    `;
    return { ...htmlProps, className: cx(heading, htmlProps.className) };
  },
});

const Heading = createComponent({
  as: "h1",
  useHook: useHeading,
});

export default Heading;
