import forwardRef from "./_utils/forwardRef";
import { render } from "./utils";
import { useThemeProps } from "./theme";
import { BoxProps, useBoxProps } from "./box";
import mergeProps from "./utils/mergeProps";
import { As } from "./_utils/types";

// TODO createHook
function createComponent<T extends keyof JSX.IntrinsicElements>(
  tag: T,
  hook: string
) {
  return forwardRef(
    <TT extends As = T>({
      as = (tag as unknown) as TT,
      theme,
      ...props
    }: BoxProps<TT>) => {
      const themeProps = useThemeProps(hook, { theme });
      const boxProps = useBoxProps({ theme });
      return render(mergeProps({ as }, themeProps, boxProps, props));
    }
  );
}

export const A = createComponent("a", "useA");
export const Abbr = createComponent("abbr", "useAbbr");
export const Address = createComponent("address", "useAddress");
export const Area = createComponent("area", "useArea");
export const Article = createComponent("article", "useArticle");
export const Aside = createComponent("aside", "useAside");
export const Audio = createComponent("audio", "useAudio");
export const B = createComponent("b", "useB");
export const Bdi = createComponent("bdi", "useBdi");
export const Bdo = createComponent("bdo", "useBdo");
export const Big = createComponent("big", "useBig");
export const Blockquote = createComponent("blockquote", "useBlockquote");
export const Br = createComponent("br", "useBr");
export const Button = createComponent("button", "useButton");
export const Canvas = createComponent("canvas", "useCanvas");
export const Caption = createComponent("caption", "useCaption");
export const Cite = createComponent("cite", "useCite");
export const Code = createComponent("code", "useCode");
export const Col = createComponent("col", "useCol");
export const Colgroup = createComponent("colgroup", "useColgroup");
export const Data = createComponent("data", "useData");
export const Datalist = createComponent("datalist", "useDatalist");
export const Dd = createComponent("dd", "useDd");
export const Del = createComponent("del", "useDel");
export const Details = createComponent("details", "useDetails");
export const Dfn = createComponent("dfn", "useDfn");
export const Dialog = createComponent("dialog", "useDialog");
export const Div = createComponent("div", "useDiv");
export const Dl = createComponent("dl", "useDl");
export const Dt = createComponent("dt", "useDt");
export const Em = createComponent("em", "useEm");
export const Embed = createComponent("embed", "useEmbed");
export const Fieldset = createComponent("fieldset", "useFieldset");
export const Figcaption = createComponent("figcaption", "useFigcaption");
export const Figure = createComponent("figure", "useFigure");
export const Footer = createComponent("footer", "useFooter");
export const Form = createComponent("form", "useForm");
export const H1 = createComponent("h1", "useH1");
export const H2 = createComponent("h2", "useH2");
export const H3 = createComponent("h3", "useH3");
export const H4 = createComponent("h4", "useH4");
export const H5 = createComponent("h5", "useH5");
export const H6 = createComponent("h6", "useH6");
export const Header = createComponent("header", "useHeader");
export const Hgroup = createComponent("hgroup", "useHgroup");
export const Hr = createComponent("hr", "useHr");
export const I = createComponent("i", "useI");
export const Iframe = createComponent("iframe", "useIframe");
export const Img = createComponent("img", "useImg");
export const Input = createComponent("input", "useInput");
export const Ins = createComponent("ins", "useIns");
export const Kbd = createComponent("kbd", "useKbd");
export const Keygen = createComponent("keygen", "useKeygen");
export const Label = createComponent("label", "useLabel");
export const Legend = createComponent("legend", "useLegend");
export const Li = createComponent("li", "useLi");
export const Main = createComponent("main", "useMain");
export const Map = createComponent("map", "useMap");
export const Mark = createComponent("mark", "useMark");
export const Menu = createComponent("menu", "useMenu");
export const MenuItem = createComponent("menuitem", "useMenuItem");
export const Meta = createComponent("meta", "useMeta");
export const Meter = createComponent("meter", "useMeter");
export const Nav = createComponent("nav", "useNav");
export const Noindex = createComponent("noindex", "useNoindex");
export const Object = createComponent("object", "useObject");
export const Ol = createComponent("ol", "useOl");
export const Optgroup = createComponent("optgroup", "useOptgroup");
export const Option = createComponent("option", "useOption");
export const Output = createComponent("output", "useOutput");
export const P = createComponent("p", "useP");
export const Param = createComponent("param", "useParam");
export const Picture = createComponent("picture", "usePicture");
export const Pre = createComponent("pre", "usePre");
export const Progress = createComponent("progress", "useProgress");
export const Q = createComponent("q", "useQ");
export const Rp = createComponent("rp", "useRp");
export const Rt = createComponent("rt", "useRt");
export const Ruby = createComponent("ruby", "useRuby");
export const S = createComponent("s", "useS");
export const Samp = createComponent("samp", "useSamp");
export const Section = createComponent("section", "useSection");
export const Select = createComponent("select", "useSelect");
export const Small = createComponent("small", "useSmall");
export const Source = createComponent("source", "useSource");
export const Span = createComponent("span", "useSpan");
export const Strong = createComponent("strong", "useStrong");
export const Sub = createComponent("sub", "useSub");
export const Summary = createComponent("summary", "useSummary");
export const Sup = createComponent("sup", "useSup");
export const Table = createComponent("table", "useTable");
export const Tbody = createComponent("tbody", "useTbody");
export const Td = createComponent("td", "useTd");
export const Textarea = createComponent("textarea", "useTextarea");
export const Tfoot = createComponent("tfoot", "useTfoot");
export const Th = createComponent("th", "useTh");
export const Thead = createComponent("thead", "useThead");
export const Time = createComponent("time", "useTime");
export const Tr = createComponent("tr", "useTr");
export const Track = createComponent("track", "useTrack");
export const U = createComponent("u", "useU");
export const Ul = createComponent("ul", "useUl");
export const Video = createComponent("video", "useVideo");
export const Wbr = createComponent("wbr", "useWbr");
export const Webview = createComponent("webview", "useWebview");
