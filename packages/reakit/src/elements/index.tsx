import * as React from "react";
import forwardRef from "../_utils/forwardRef";
import { As } from "../_utils/types";
import { useCreateElement } from "../utils";
import { useThemeHook } from "../theme";
import { BoxProps, useBoxProps, BoxOptions } from "../box";

function createHook<T extends keyof JSX.IntrinsicElements>(hookName: string) {
  const useHook = (
    options: BoxOptions = {},
    props: React.ComponentPropsWithRef<T> = {} as typeof props
  ) => {
    props = useBoxProps(options, props) as typeof props;
    return useThemeHook(hookName, options, props);
  };

  Object.defineProperty(useHook, "name", {
    value: hookName
  });

  return useHook;
}

function createComponent<T extends keyof JSX.IntrinsicElements>(
  tag: T,
  useHook: ReturnType<typeof createHook>
) {
  return forwardRef(
    <TT extends As = T>(
      { as = (tag as unknown) as TT, ...props }: BoxProps<TT>,
      ref: React.Ref<any>
    ) => {
      props = { as, ref, ...props };
      props = useHook(props, props) as typeof props;
      return useCreateElement(props);
    }
  );
}

export const useAProps = createHook<"a">("useAProps");
export const A = createComponent("a", useAProps);

export const useAbbrProps = createHook<"abbr">("useAbbrProps");
export const Abbr = createComponent("abbr", useAbbrProps);

export const useAddressProps = createHook<"address">("useAddressProps");
export const Address = createComponent("address", useAddressProps);

export const useAreaProps = createHook<"area">("useAreaProps");
export const Area = createComponent("area", useAreaProps);

export const useArticleProps = createHook<"article">("useArticleProps");
export const Article = createComponent("article", useArticleProps);

export const useAsideProps = createHook<"aside">("useAsideProps");
export const Aside = createComponent("aside", useAsideProps);

export const useBlockquoteProps = createHook<"blockquote">(
  "useBlockquoteProps"
);
export const Blockquote = createComponent("blockquote", useBlockquoteProps);

export const useButtonProps = createHook<"button">("useButtonProps");
export const Button = createComponent("button", useButtonProps);

export const useCaptionProps = createHook<"caption">("useCaptionProps");
export const Caption = createComponent("caption", useCaptionProps);

export const useCiteProps = createHook<"cite">("useCiteProps");
export const Cite = createComponent("cite", useCiteProps);

export const useCodeProps = createHook<"code">("useCodeProps");
export const Code = createComponent("code", useCodeProps);

export const useColProps = createHook<"col">("useColProps");
export const Col = createComponent("col", useColProps);

export const useColgroupProps = createHook<"colgroup">("useColgroupProps");
export const Colgroup = createComponent("colgroup", useColgroupProps);

export const useDdProps = createHook<"dd">("useDdProps");
export const Dd = createComponent("dd", useDdProps);

export const useDelProps = createHook<"del">("useDelProps");
export const Del = createComponent("del", useDelProps);

export const useDetailsProps = createHook<"details">("useDetailsProps");
export const Details = createComponent("details", useDetailsProps);

export const useDfnProps = createHook<"dfn">("useDfnProps");
export const Dfn = createComponent("dfn", useDfnProps);

export const useDivProps = createHook<"div">("useDivProps");
export const Div = createComponent("div", useDivProps);

export const useDlProps = createHook<"dl">("useDlProps");
export const Dl = createComponent("dl", useDlProps);

export const useDtProps = createHook<"dt">("useDtProps");
export const Dt = createComponent("dt", useDtProps);

export const useEmProps = createHook<"em">("useEmProps");
export const Em = createComponent("em", useEmProps);

export const useFieldsetProps = createHook<"fieldset">("useFieldsetProps");
export const Fieldset = createComponent("fieldset", useFieldsetProps);

export const useFigcaptionProps = createHook<"figcaption">(
  "useFigcaptionProps"
);
export const Figcaption = createComponent("figcaption", useFigcaptionProps);

export const useFigureProps = createHook<"figure">("useFigureProps");
export const Figure = createComponent("figure", useFigureProps);

export const useFooterProps = createHook<"footer">("useFooterProps");
export const Footer = createComponent("footer", useFooterProps);

export const useH1Props = createHook<"h1">("useH1Props");
export const H1 = createComponent("h1", useH1Props);

export const useH2Props = createHook<"h2">("useH2Props");
export const H2 = createComponent("h2", useH2Props);

export const useH3Props = createHook<"h3">("useH3Props");
export const H3 = createComponent("h3", useH3Props);

export const useH4Props = createHook<"h4">("useH4Props");
export const H4 = createComponent("h4", useH4Props);

export const useH5Props = createHook<"h5">("useH5Props");
export const H5 = createComponent("h5", useH5Props);

export const useH6Props = createHook<"h6">("useH6Props");
export const H6 = createComponent("h6", useH6Props);

export const useHeaderProps = createHook<"header">("useHeaderProps");
export const Header = createComponent("header", useHeaderProps);

export const useHgroupProps = createHook<"hgroup">("useHgroupProps");
export const Hgroup = createComponent("hgroup", useHgroupProps);

export const useHrProps = createHook<"hr">("useHrProps");
export const Hr = createComponent("hr", useHrProps);

export const useImgProps = createHook<"img">("useImgProps");
export const Img = createComponent("img", useImgProps);

export const useInputProps = createHook<"input">("useInputProps");
export const Input = createComponent("input", useInputProps);

export const useInsProps = createHook<"ins">("useInsProps");
export const Ins = createComponent("ins", useInsProps);

export const useLabelProps = createHook<"label">("useLabelProps");
export const Label = createComponent("label", useLabelProps);

export const useLegendProps = createHook<"legend">("useLegendProps");
export const Legend = createComponent("legend", useLegendProps);

export const useLiProps = createHook<"li">("useLiProps");
export const Li = createComponent("li", useLiProps);

export const useMainProps = createHook<"main">("useMainProps");
export const Main = createComponent("main", useMainProps);

export const useNavProps = createHook<"nav">("useNavProps");
export const Nav = createComponent("nav", useNavProps);

export const useOlProps = createHook<"ol">("useOlProps");
export const Ol = createComponent("ol", useOlProps);

export const usePProps = createHook<"p">("usePProps");
export const P = createComponent("p", usePProps);

export const usePreProps = createHook<"pre">("usePreProps");
export const Pre = createComponent("pre", usePreProps);

export const useSampProps = createHook<"samp">("useSampProps");
export const Samp = createComponent("samp", useSampProps);

export const useSectionProps = createHook<"section">("useSectionProps");
export const Section = createComponent("section", useSectionProps);

export const useSelectProps = createHook<"select">("useSelectProps");
export const Select = createComponent("select", useSelectProps);

export const useSpanProps = createHook<"span">("useSpanProps");
export const Span = createComponent("span", useSpanProps);

export const useStrongProps = createHook<"strong">("useStrongProps");
export const Strong = createComponent("strong", useStrongProps);

export const useSubProps = createHook<"sub">("useSubProps");
export const Sub = createComponent("sub", useSubProps);

export const useSummaryProps = createHook<"summary">("useSummaryProps");
export const Summary = createComponent("summary", useSummaryProps);

export const useSupProps = createHook<"sup">("useSupProps");
export const Sup = createComponent("sup", useSupProps);

export const useTableProps = createHook<"table">("useTableProps");
export const Table = createComponent("table", useTableProps);

export const useTbodyProps = createHook<"tbody">("useTbodyProps");
export const Tbody = createComponent("tbody", useTbodyProps);

export const useTdProps = createHook<"td">("useTdProps");
export const Td = createComponent("td", useTdProps);

export const useTextareaProps = createHook<"textarea">("useTextareaProps");
export const Textarea = createComponent("textarea", useTextareaProps);

export const useTfootProps = createHook<"tfoot">("useTfootProps");
export const Tfoot = createComponent("tfoot", useTfootProps);

export const useThProps = createHook<"th">("useThProps");
export const Th = createComponent("th", useThProps);

export const useTheadProps = createHook<"thead">("useTheadProps");
export const Thead = createComponent("thead", useTheadProps);

export const useTimeProps = createHook<"time">("useTimeProps");
export const Time = createComponent("time", useTimeProps);

export const useTrProps = createHook<"tr">("useTrProps");
export const Tr = createComponent("tr", useTrProps);

export const useUlProps = createHook<"ul">("useUlProps");
export const Ul = createComponent("ul", useUlProps);
