import forwardRef from "./_utils/forwardRef";
import { render } from "./utils";
import { useThemeHook } from "./theme";
import { BoxProps, useBoxProps, UseBoxPropsOptions } from "./box";
import { As, HTMLAttributesWithRef } from "./_utils/types";

function createHook(name: string) {
  return <P extends HTMLAttributesWithRef = HTMLAttributesWithRef>(
    options: UseBoxPropsOptions,
    props = {} as P
  ) => {
    props = useBoxProps(options, props);
    return useThemeHook(name, options, props);
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
      props = useHook(props, props);
      return render(props);
    }
  );
}

export const useAProps = createHook("useAProps");
export const A = createComponent("a", useAProps);

export const useAbbrProps = createHook("useAbbrProps");
export const Abbr = createComponent("abbr", useAbbrProps);

export const useAddressProps = createHook("useAddressProps");
export const Address = createComponent("address", useAddressProps);

export const useAreaProps = createHook("useAreaProps");
export const Area = createComponent("area", useAreaProps);

export const useArticleProps = createHook("useArticleProps");
export const Article = createComponent("article", useArticleProps);

export const useAsideProps = createHook("useAsideProps");
export const Aside = createComponent("aside", useAsideProps);

export const useAudioProps = createHook("useAudioProps");
export const Audio = createComponent("audio", useAudioProps);

export const useBProps = createHook("useBProps");
export const B = createComponent("b", useBProps);

export const useBdiProps = createHook("useBdiProps");
export const Bdi = createComponent("bdi", useBdiProps);

export const useBdoProps = createHook("useBdoProps");
export const Bdo = createComponent("bdo", useBdoProps);

export const useBigProps = createHook("useBigProps");
export const Big = createComponent("big", useBigProps);

export const useBlockquoteProps = createHook("useBlockquoteProps");
export const Blockquote = createComponent("blockquote", useBlockquoteProps);

export const useBrProps = createHook("useBrProps");
export const Br = createComponent("br", useBrProps);

export const useButtonProps = createHook("useButtonProps");
export const Button = createComponent("button", useButtonProps);

export const useCanvasProps = createHook("useCanvasProps");
export const Canvas = createComponent("canvas", useCanvasProps);

export const useCaptionProps = createHook("useCaptionProps");
export const Caption = createComponent("caption", useCaptionProps);

export const useCiteProps = createHook("useCiteProps");
export const Cite = createComponent("cite", useCiteProps);

export const useCodeProps = createHook("useCodeProps");
export const Code = createComponent("code", useCodeProps);

export const useColProps = createHook("useColProps");
export const Col = createComponent("col", useColProps);

export const useColgroupProps = createHook("useColgroupProps");
export const Colgroup = createComponent("colgroup", useColgroupProps);

export const useDataProps = createHook("useDataProps");
export const Data = createComponent("data", useDataProps);

export const useDatalistProps = createHook("useDatalistProps");
export const Datalist = createComponent("datalist", useDatalistProps);

export const useDdProps = createHook("useDdProps");
export const Dd = createComponent("dd", useDdProps);

export const useDelProps = createHook("useDelProps");
export const Del = createComponent("del", useDelProps);

export const useDetailsProps = createHook("useDetailsProps");
export const Details = createComponent("details", useDetailsProps);

export const useDfnProps = createHook("useDfnProps");
export const Dfn = createComponent("dfn", useDfnProps);

export const useDialogProps = createHook("useDialogProps");
export const Dialog = createComponent("dialog", useDialogProps);

export const useDivProps = createHook("useDivProps");
export const Div = createComponent("div", useDivProps);

export const useDlProps = createHook("useDlProps");
export const Dl = createComponent("dl", useDlProps);

export const useDtProps = createHook("useDtProps");
export const Dt = createComponent("dt", useDtProps);

export const useEmProps = createHook("useEmProps");
export const Em = createComponent("em", useEmProps);

export const useEmbedProps = createHook("useEmbedProps");
export const Embed = createComponent("embed", useEmbedProps);

export const useFieldsetProps = createHook("useFieldsetProps");
export const Fieldset = createComponent("fieldset", useFieldsetProps);

export const useFigcaptionProps = createHook("useFigcaptionProps");
export const Figcaption = createComponent("figcaption", useFigcaptionProps);

export const useFigureProps = createHook("useFigureProps");
export const Figure = createComponent("figure", useFigureProps);

export const useFooterProps = createHook("useFooterProps");
export const Footer = createComponent("footer", useFooterProps);

export const useFormProps = createHook("useFormProps");
export const Form = createComponent("form", useFormProps);

export const useH1Props = createHook("useH1Props");
export const H1 = createComponent("h1", useH1Props);

export const useH2Props = createHook("useH2Props");
export const H2 = createComponent("h2", useH2Props);

export const useH3Props = createHook("useH3Props");
export const H3 = createComponent("h3", useH3Props);

export const useH4Props = createHook("useH4Props");
export const H4 = createComponent("h4", useH4Props);

export const useH5Props = createHook("useH5Props");
export const H5 = createComponent("h5", useH5Props);

export const useH6Props = createHook("useH6Props");
export const H6 = createComponent("h6", useH6Props);

export const useHeaderProps = createHook("useHeaderProps");
export const Header = createComponent("header", useHeaderProps);

export const useHgroupProps = createHook("useHgroupProps");
export const Hgroup = createComponent("hgroup", useHgroupProps);

export const useHrProps = createHook("useHrProps");
export const Hr = createComponent("hr", useHrProps);

export const useIProps = createHook("useIProps");
export const I = createComponent("i", useIProps);

export const useIframeProps = createHook("useIframeProps");
export const Iframe = createComponent("iframe", useIframeProps);

export const useImgProps = createHook("useImgProps");
export const Img = createComponent("img", useImgProps);

export const useInputProps = createHook("useInputProps");
export const Input = createComponent("input", useInputProps);

export const useInsProps = createHook("useInsProps");
export const Ins = createComponent("ins", useInsProps);

export const useKbdProps = createHook("useKbdProps");
export const Kbd = createComponent("kbd", useKbdProps);

export const useKeygenProps = createHook("useKeygenProps");
export const Keygen = createComponent("keygen", useKeygenProps);

export const useLabelProps = createHook("useLabelProps");
export const Label = createComponent("label", useLabelProps);

export const useLegendProps = createHook("useLegendProps");
export const Legend = createComponent("legend", useLegendProps);

export const useLiProps = createHook("useLiProps");
export const Li = createComponent("li", useLiProps);

export const useMainProps = createHook("useMainProps");
export const Main = createComponent("main", useMainProps);

export const useMapProps = createHook("useMapProps");
export const Map = createComponent("map", useMapProps);

export const useMarkProps = createHook("useMarkProps");
export const Mark = createComponent("mark", useMarkProps);

export const useMenuProps = createHook("useMenuProps");
export const Menu = createComponent("menu", useMenuProps);

export const useMenuItemProps = createHook("useMenuItemProps");
export const MenuItem = createComponent("menuitem", useMenuItemProps);

export const useMetaProps = createHook("useMetaProps");
export const Meta = createComponent("meta", useMetaProps);

export const useMeterProps = createHook("useMeterProps");
export const Meter = createComponent("meter", useMeterProps);

export const useNavProps = createHook("useNavProps");
export const Nav = createComponent("nav", useNavProps);

export const useNoindexProps = createHook("useNoindexProps");
export const Noindex = createComponent("noindex", useNoindexProps);

export const useOlProps = createHook("useOlProps");
export const Ol = createComponent("ol", useOlProps);

export const useOptgroupProps = createHook("useOptgroupProps");
export const Optgroup = createComponent("optgroup", useOptgroupProps);

export const useOptionProps = createHook("useOptionProps");
export const Option = createComponent("option", useOptionProps);

export const useOutputProps = createHook("useOutputProps");
export const Output = createComponent("output", useOutputProps);

export const usePProps = createHook("usePProps");
export const P = createComponent("p", usePProps);

export const useParamProps = createHook("useParamProps");
export const Param = createComponent("param", useParamProps);

export const usePictureProps = createHook("usePictureProps");
export const Picture = createComponent("picture", usePictureProps);

export const usePreProps = createHook("usePreProps");
export const Pre = createComponent("pre", usePreProps);

export const useProgressProps = createHook("useProgressProps");
export const Progress = createComponent("progress", useProgressProps);

export const useQProps = createHook("useQProps");
export const Q = createComponent("q", useQProps);

export const useRpProps = createHook("useRpProps");
export const Rp = createComponent("rp", useRpProps);

export const useRtProps = createHook("useRtProps");
export const Rt = createComponent("rt", useRtProps);

export const useRubyProps = createHook("useRubyProps");
export const Ruby = createComponent("ruby", useRubyProps);

export const useSProps = createHook("useSProps");
export const S = createComponent("s", useSProps);

export const useSampProps = createHook("useSampProps");
export const Samp = createComponent("samp", useSampProps);

export const useSectionProps = createHook("useSectionProps");
export const Section = createComponent("section", useSectionProps);

export const useSelectProps = createHook("useSelectProps");
export const Select = createComponent("select", useSelectProps);

export const useSmallProps = createHook("useSmallProps");
export const Small = createComponent("small", useSmallProps);

export const useSourceProps = createHook("useSourceProps");
export const Source = createComponent("source", useSourceProps);

export const useSpanProps = createHook("useSpanProps");
export const Span = createComponent("span", useSpanProps);

export const useStrongProps = createHook("useStrongProps");
export const Strong = createComponent("strong", useStrongProps);

export const useSubProps = createHook("useSubProps");
export const Sub = createComponent("sub", useSubProps);

export const useSummaryProps = createHook("useSummaryProps");
export const Summary = createComponent("summary", useSummaryProps);

export const useSupProps = createHook("useSupProps");
export const Sup = createComponent("sup", useSupProps);

export const useTableProps = createHook("useTableProps");
export const Table = createComponent("table", useTableProps);

export const useTbodyProps = createHook("useTbodyProps");
export const Tbody = createComponent("tbody", useTbodyProps);

export const useTdProps = createHook("useTdProps");
export const Td = createComponent("td", useTdProps);

export const useTextareaProps = createHook("useTextareaProps");
export const Textarea = createComponent("textarea", useTextareaProps);

export const useTfootProps = createHook("useTfootProps");
export const Tfoot = createComponent("tfoot", useTfootProps);

export const useThProps = createHook("useThProps");
export const Th = createComponent("th", useThProps);

export const useTheadProps = createHook("useTheadProps");
export const Thead = createComponent("thead", useTheadProps);

export const useTimeProps = createHook("useTimeProps");
export const Time = createComponent("time", useTimeProps);

export const useTrProps = createHook("useTrProps");
export const Tr = createComponent("tr", useTrProps);

export const useTrackProps = createHook("useTrackProps");
export const Track = createComponent("track", useTrackProps);

export const useUProps = createHook("useUProps");
export const U = createComponent("u", useUProps);

export const useUlProps = createHook("useUlProps");
export const Ul = createComponent("ul", useUlProps);

export const useVideoProps = createHook("useVideoProps");
export const Video = createComponent("video", useVideoProps);

export const useWbrProps = createHook("useWbrProps");
export const Wbr = createComponent("wbr", useWbrProps);

export const useWebviewProps = createHook("useWebviewProps");
export const Webview = createComponent("webview", useWebviewProps);
