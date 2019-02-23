import { createComponent } from "../_utils/createComponent";
import { useHook } from "../theme/useHook";
import { useBox, UseBoxOptions, UseBoxProps } from "../box/useBox";

function createHook(hookName: string) {
  const useElement = (options: UseBoxOptions = {}, props: UseBoxProps = {}) => {
    props = useBox(options, props);
    props = useHook(hookName, options, props);
    return props;
  };

  useElement.keys = useBox.keys;

  Object.defineProperty(useElement, "name", {
    value: hookName
  });

  return useElement;
}

export const useA = createHook("useA");
export const A = createComponent("a", useA);

export const useBlockquote = createHook("useBlockquote");
export const Blockquote = createComponent("blockquote", useBlockquote);

export const useCaption = createHook("useCaption");
export const Caption = createComponent("caption", useCaption);

export const useCite = createHook("useCite");
export const Cite = createComponent("cite", useCite);

export const useCode = createHook("useCode");
export const Code = createComponent("code", useCode);

export const useDd = createHook("useDd");
export const Dd = createComponent("dd", useDd);

export const useDiv = createHook("useDiv");
export const Div = createComponent("div", useDiv);

export const useDl = createHook("useDl");
export const Dl = createComponent("dl", useDl);

export const useDt = createHook("useDt");
export const Dt = createComponent("dt", useDt);

export const useFieldset = createHook("useFieldset");
export const Fieldset = createComponent("fieldset", useFieldset);

export const useFigcaption = createHook("useFigcaption");
export const Figcaption = createComponent("figcaption", useFigcaption);

export const useFigure = createHook("useFigure");
export const Figure = createComponent("figure", useFigure);

export const useFooter = createHook("useFooter");
export const Footer = createComponent("footer", useFooter);

export const useH1 = createHook("useH1");
export const H1 = createComponent("h1", useH1);

export const useH2 = createHook("useH2");
export const H2 = createComponent("h2", useH2);

export const useH3 = createHook("useH3");
export const H3 = createComponent("h3", useH3);

export const useH4 = createHook("useH4");
export const H4 = createComponent("h4", useH4);

export const useH5 = createHook("useH5");
export const H5 = createComponent("h5", useH5);

export const useH6 = createHook("useH6");
export const H6 = createComponent("h6", useH6);

export const useHeader = createHook("useHeader");
export const Header = createComponent("header", useHeader);

export const useHgroup = createHook("useHgroup");
export const Hgroup = createComponent("hgroup", useHgroup);

export const useHr = createHook("useHr");
export const Hr = createComponent("hr", useHr);

export const useImg = createHook("useImg");
export const Img = createComponent("img", useImg);

export const useInput = createHook("useInput");
export const Input = createComponent("input", useInput);

export const useIns = createHook("useIns");
export const Ins = createComponent("ins", useIns);

export const useKbd = createHook("useKbd");
export const Kbd = createComponent("kbd", useKbd);

export const useLabel = createHook("useLabel");
export const Label = createComponent("label", useLabel);

export const useLegend = createHook("useLegend");
export const Legend = createComponent("legend", useLegend);

export const useLi = createHook("useLi");
export const Li = createComponent("li", useLi);

export const useMark = createHook("useMark");
export const Mark = createComponent("mark", useMark);

export const useNav = createHook("useNav");
export const Nav = createComponent("nav", useNav);

export const useOl = createHook("useOl");
export const Ol = createComponent("ol", useOl);

export const useP = createHook("useP");
export const P = createComponent("p", useP);

export const usePre = createHook("usePre");
export const Pre = createComponent("pre", usePre);

export const useSelect = createHook("useSelect");
export const Select = createComponent("select", useSelect);

export const useSpan = createHook("useSpan");
export const Span = createComponent("span", useSpan);

export const useSummary = createHook("useSummary");
export const Summary = createComponent("summary", useSummary);

export const useTable = createHook("useTable");
export const Table = createComponent("table", useTable);

export const useTbody = createHook("useTbody");
export const Tbody = createComponent("tbody", useTbody);

export const useTd = createHook("useTd");
export const Td = createComponent("td", useTd);

export const useTextarea = createHook("useTextarea");
export const Textarea = createComponent("textarea", useTextarea);

export const useTfoot = createHook("useTfoot");
export const Tfoot = createComponent("tfoot", useTfoot);

export const useTh = createHook("useTh");
export const Th = createComponent("th", useTh);

export const useThead = createHook("useThead");
export const Thead = createComponent("thead", useThead);

export const useTr = createHook("useTr");
export const Tr = createComponent("tr", useTr);

export const useUl = createHook("useUl");
export const Ul = createComponent("ul", useUl);
