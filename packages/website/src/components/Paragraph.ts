import { css, cx } from "emotion";
import { useBox, BoxHTMLProps, BoxOptions } from "reakit";
import { createHook, createComponent } from "reakit-system";

export type ParagraphOptions = BoxOptions;
export type ParagraphHTMLProps = BoxHTMLProps;
export type ParagraphProps = ParagraphOptions & ParagraphHTMLProps;

export const useParagraph = createHook<ParagraphOptions, ParagraphHTMLProps>({
  name: "Paragraph",
  compose: useBox,

  useProps(_, htmlProps) {
    const paragraph = css`
      line-height: 1.5;
    `;
    return { ...htmlProps, className: cx(paragraph, htmlProps.className) };
  }
});

const Paragraph = createComponent({
  as: "p",
  useHook: useParagraph
});

export default Paragraph;
