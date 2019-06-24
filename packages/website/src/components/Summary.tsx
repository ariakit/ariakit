import { css, cx } from "emotion";
import { useBox, BoxHTMLProps, BoxOptions } from "reakit";
import { createHook, createComponent } from "reakit-system";
import { useAnchor } from "./Anchor";

export type SummaryOptions = BoxOptions & {
  experimental?: "true" | "false";
};

export type SummaryHTMLProps = BoxHTMLProps;

export type SummaryProps = SummaryOptions & SummaryHTMLProps;

export const useSummary = createHook<SummaryOptions, SummaryHTMLProps>({
  name: "Summary",
  compose: useBox,

  useProps(options, htmlProps) {
    const anchor = useAnchor(options, htmlProps);
    const summary = css`
      display: inline-block;
      padding: 0.5em 1.5em;
      cursor: pointer;
    `;

    return {
      ...htmlProps,
      ...anchor,
      className: cx(anchor.className, summary, htmlProps.className)
    };
  }
});

const Summary = createComponent({
  as: "summary",
  useHook: useSummary
});

export default Summary;
