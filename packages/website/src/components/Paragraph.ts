import { css, cx } from "emotion";
import { useBox, BoxProps, BoxOptions } from "reakit";
import { unstable_createHook } from "reakit/utils/createHook";
import { unstable_createComponent } from "reakit/utils/createComponent";

export type ParagraphOptions = BoxOptions;
export type ParagraphHTMLProps = BoxProps;
export type ParagraphProps = ParagraphOptions & ParagraphHTMLProps;

export const useParagraph = unstable_createHook<
  ParagraphOptions,
  ParagraphHTMLProps
>({
  name: "Paragraph",
  compose: useBox,

  useProps(_, htmlProps) {
    const paragraph = css`
      line-height: 1.5;
    `;
    return { ...htmlProps, className: cx(paragraph, htmlProps.className) };
  }
});

const Paragraph = unstable_createComponent({
  as: "p",
  useHook: useParagraph
});

export default Paragraph;
