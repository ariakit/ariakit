import * as React from "react";
import { css, cx } from "emotion";
import { useBox, BoxHTMLProps, BoxOptions } from "reakit";
import { usePalette } from "reakit-system-palette/utils";
import { createHook, createComponent, useCreateElement } from "reakit-system";
import { Link } from "gatsby";

export type AnchorOptions = BoxOptions;
export type AnchorHTMLProps = BoxHTMLProps & React.AnchorHTMLAttributes<any>;
export type AnchorProps = AnchorOptions & AnchorHTMLProps;

export const useAnchor = createHook<AnchorOptions, AnchorHTMLProps>({
  name: "Anchor",
  compose: useBox,

  useProps(_, htmlProps) {
    const color = usePalette("link");
    const anchor = css`
      color: ${color};
      font-weight: 500;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    `;
    return { ...htmlProps, className: cx(anchor, htmlProps.className) };
  }
});

const Anchor = createComponent({
  as: "a",
  useHook: useAnchor,

  useCreateElement(type, { href, ...props }, children) {
    if (href && /^\/(?!\/)/.test(href)) {
      return useCreateElement(Link, { to: href, ...props }, children);
    }
    return useCreateElement(type, { href, ...props }, children);
  }
});

export default Anchor;
