import { css, cx } from "emotion";
import { createHook, createComponent } from "reakit-system";
import { usePalette } from "reakit-system-palette/utils";
import { useAnchor, AnchorOptions, AnchorProps } from "./Anchor";

export type SkipToContentOptions = AnchorOptions;
export type SkipToContentHTMLProps = AnchorProps;
export type SkipToContentProps = SkipToContentOptions & SkipToContentHTMLProps;

export const useSkipToContent = createHook<
  SkipToContentOptions,
  SkipToContentHTMLProps
>({
  name: "SkipToContent",
  compose: useAnchor,

  useProps(_, htmlProps) {
    const background = usePalette("background");

    const skipToContent = css`
      left: -999px;
      position: absolute;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
      z-index: -999;
      &:focus,
      &:active {
        background-color: ${background} !important;
        left: auto;
        top: auto;
        height: auto;
        width: max-content;
        overflow: auto;
        padding: 1em;
        margin: 1em;
        text-align: center;
        z-index: 999;
      }
    `;
    return {
      tabIndex: 0,
      children: "Skip to main content",
      href: "#main",
      ...htmlProps,
      className: cx(skipToContent, htmlProps.className)
    };
  }
});

const SkipToContent = createComponent({
  as: "a",
  useHook: useSkipToContent
});

export default SkipToContent;
