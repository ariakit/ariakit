import * as React from "react";
import forwardRef from "../_utils/forwardRef";
import { render } from "../utils";
import { useThemeHook } from "../theme";
import { BoxProps, useBoxProps, UseBoxPropsOptions } from "../box";
import { As } from "../_utils/types";

function createHook<T extends keyof JSX.IntrinsicElements>(hookName: string) {
  return (
    options: UseBoxPropsOptions = {},
    props: React.ComponentPropsWithRef<T> = {} as typeof props
  ) => {
    props = useBoxProps(options, props) as typeof props;
    return useThemeHook(hookName, options, props);
  };
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
      return render(props);
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

export const useAudioProps = createHook<"audio">("useAudioProps");
export const Audio = createComponent("audio", useAudioProps);

export const useBProps = createHook<"b">("useBProps");
export const B = createComponent("b", useBProps);

export const useBdiProps = createHook<"bdi">("useBdiProps");
export const Bdi = createComponent("bdi", useBdiProps);

export const useBdoProps = createHook<"bdo">("useBdoProps");
export const Bdo = createComponent("bdo", useBdoProps);

export const useBigProps = createHook<"big">("useBigProps");
export const Big = createComponent("big", useBigProps);

export const useBlockquoteProps = createHook<"blockquote">(
  "useBlockquoteProps"
);
export const Blockquote = createComponent("blockquote", useBlockquoteProps);

export const useBrProps = createHook<"br">("useBrProps");
export const Br = createComponent("br", useBrProps);

export const useButtonProps = createHook<"button">("useButtonProps");
export const Button = createComponent("button", useButtonProps);

export const useCanvasProps = createHook<"canvas">("useCanvasProps");
export const Canvas = createComponent("canvas", useCanvasProps);

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

export const useDataProps = createHook<"data">("useDataProps");
export const Data = createComponent("data", useDataProps);

export const useDatalistProps = createHook<"datalist">("useDatalistProps");
export const Datalist = createComponent("datalist", useDatalistProps);

export const useDdProps = createHook<"dd">("useDdProps");
export const Dd = createComponent("dd", useDdProps);

export const useDelProps = createHook<"del">("useDelProps");
export const Del = createComponent("del", useDelProps);

export const useDetailsProps = createHook<"details">("useDetailsProps");
export const Details = createComponent("details", useDetailsProps);

export const useDfnProps = createHook<"dfn">("useDfnProps");
export const Dfn = createComponent("dfn", useDfnProps);

export const useDialogProps = createHook<"dialog">("useDialogProps");
export const Dialog = createComponent("dialog", useDialogProps);

export const useDivProps = createHook<"div">("useDivProps");
export const Div = createComponent("div", useDivProps);

export const useDlProps = createHook<"dl">("useDlProps");
export const Dl = createComponent("dl", useDlProps);

export const useDtProps = createHook<"dt">("useDtProps");
export const Dt = createComponent("dt", useDtProps);

export const useEmProps = createHook<"em">("useEmProps");
export const Em = createComponent("em", useEmProps);

export const useEmbedProps = createHook<"embed">("useEmbedProps");
export const Embed = createComponent("embed", useEmbedProps);

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

export const useFormProps = createHook<"form">("useFormProps");
export const Form = createComponent("form", useFormProps);

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

export const useIProps = createHook<"i">("useIProps");
export const I = createComponent("i", useIProps);

export const useIframeProps = createHook<"iframe">("useIframeProps");
export const Iframe = createComponent("iframe", useIframeProps);

export const useImgProps = createHook<"img">("useImgProps");
export const Img = createComponent("img", useImgProps);

export const useInputProps = createHook<"input">("useInputProps");
export const Input = createComponent("input", useInputProps);

export const useInsProps = createHook<"ins">("useInsProps");
export const Ins = createComponent("ins", useInsProps);

export const useKbdProps = createHook<"kbd">("useKbdProps");
export const Kbd = createComponent("kbd", useKbdProps);

export const useKeygenProps = createHook<"keygen">("useKeygenProps");
export const Keygen = createComponent("keygen", useKeygenProps);

export const useLabelProps = createHook<"label">("useLabelProps");
export const Label = createComponent("label", useLabelProps);

export const useLegendProps = createHook<"legend">("useLegendProps");
export const Legend = createComponent("legend", useLegendProps);

export const useLiProps = createHook<"li">("useLiProps");
export const Li = createComponent("li", useLiProps);

export const useMainProps = createHook<"main">("useMainProps");
export const Main = createComponent("main", useMainProps);

export const useMapProps = createHook<"map">("useMapProps");
export const Map = createComponent("map", useMapProps);

export const useMarkProps = createHook<"mark">("useMarkProps");
export const Mark = createComponent("mark", useMarkProps);

export const useMenuProps = createHook<"menu">("useMenuProps");
export const Menu = createComponent("menu", useMenuProps);

export const useMenuItemProps = createHook<"menuitem">("useMenuItemProps");
export const MenuItem = createComponent("menuitem", useMenuItemProps);

export const useMetaProps = createHook<"meta">("useMetaProps");
export const Meta = createComponent("meta", useMetaProps);

export const useMeterProps = createHook<"meter">("useMeterProps");
export const Meter = createComponent("meter", useMeterProps);

export const useNavProps = createHook<"nav">("useNavProps");
export const Nav = createComponent("nav", useNavProps);

export const useNoindexProps = createHook<"noindex">("useNoindexProps");
export const Noindex = createComponent("noindex", useNoindexProps);

export const useOlProps = createHook<"ol">("useOlProps");
export const Ol = createComponent("ol", useOlProps);

export const useOptgroupProps = createHook<"optgroup">("useOptgroupProps");
export const Optgroup = createComponent("optgroup", useOptgroupProps);

export const useOptionProps = createHook<"option">("useOptionProps");
export const Option = createComponent("option", useOptionProps);

export const useOutputProps = createHook<"output">("useOutputProps");
export const Output = createComponent("output", useOutputProps);

export const usePProps = createHook<"p">("usePProps");
export const P = createComponent("p", usePProps);

export const useParamProps = createHook<"param">("useParamProps");
export const Param = createComponent("param", useParamProps);

export const usePictureProps = createHook<"picture">("usePictureProps");
export const Picture = createComponent("picture", usePictureProps);

export const usePreProps = createHook<"pre">("usePreProps");
export const Pre = createComponent("pre", usePreProps);

export const useProgressProps = createHook<"progress">("useProgressProps");
export const Progress = createComponent("progress", useProgressProps);

export const useQProps = createHook<"q">("useQProps");
export const Q = createComponent("q", useQProps);

export const useRpProps = createHook<"rp">("useRpProps");
export const Rp = createComponent("rp", useRpProps);

export const useRtProps = createHook<"rt">("useRtProps");
export const Rt = createComponent("rt", useRtProps);

export const useRubyProps = createHook<"ruby">("useRubyProps");
export const Ruby = createComponent("ruby", useRubyProps);

export const useSProps = createHook<"s">("useSProps");
export const S = createComponent("s", useSProps);

export const useSampProps = createHook<"samp">("useSampProps");
export const Samp = createComponent("samp", useSampProps);

export const useSectionProps = createHook<"section">("useSectionProps");
export const Section = createComponent("section", useSectionProps);

export const useSelectProps = createHook<"select">("useSelectProps");
export const Select = createComponent("select", useSelectProps);

export const useSmallProps = createHook<"small">("useSmallProps");
export const Small = createComponent("small", useSmallProps);

export const useSourceProps = createHook<"source">("useSourceProps");
export const Source = createComponent("source", useSourceProps);

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

export const useTrackProps = createHook<"track">("useTrackProps");
export const Track = createComponent("track", useTrackProps);

export const useUProps = createHook<"u">("useUProps");
export const U = createComponent("u", useUProps);

export const useUlProps = createHook<"ul">("useUlProps");
export const Ul = createComponent("ul", useUlProps);

export const useVideoProps = createHook<"video">("useVideoProps");
export const Video = createComponent("video", useVideoProps);

export const useWbrProps = createHook<"wbr">("useWbrProps");
export const Wbr = createComponent("wbr", useWbrProps);

export const useWebviewProps = createHook<"webview">("useWebviewProps");
export const Webview = createComponent("webview", useWebviewProps);
