import { unstable_useHook } from "reakit/system/useHook";
import { unstable_createComponent } from "reakit/utils/createComponent";
import { useBox, unstable_BoxOptions, unstable_BoxProps } from "reakit/Box/Box";

function createHook(hookName: string) {
  const useElement = (
    options: unstable_BoxOptions = {},
    props: unstable_BoxProps = {}
  ) => {
    props = useBox(options, props);
    props = unstable_useHook(hookName, options, props);
    return props;
  };

  useElement.keys = useBox.keys;

  Object.defineProperty(useElement, "name", {
    value: hookName
  });

  return useElement;
}

export const useA = createHook("useA");
export const A = unstable_createComponent("a", useA);

export const useBlockquote = createHook("useBlockquote");
export const Blockquote = unstable_createComponent("blockquote", useBlockquote);

export const useButton = createHook("useButton");
export const Button = unstable_createComponent("button", useButton);

export const useCaption = createHook("useCaption");
export const Caption = unstable_createComponent("caption", useCaption);

export const useCite = createHook("useCite");
export const Cite = unstable_createComponent("cite", useCite);

export const useCode = createHook("useCode");
export const Code = unstable_createComponent("code", useCode);

export const useDd = createHook("useDd");
export const Dd = unstable_createComponent("dd", useDd);

export const useDiv = createHook("useDiv");
export const Div = unstable_createComponent("div", useDiv);

export const useDl = createHook("useDl");
export const Dl = unstable_createComponent("dl", useDl);

export const useDt = createHook("useDt");
export const Dt = unstable_createComponent("dt", useDt);

export const useFieldset = createHook("useFieldset");
export const Fieldset = unstable_createComponent("fieldset", useFieldset);

export const useFigcaption = createHook("useFigcaption");
export const Figcaption = unstable_createComponent("figcaption", useFigcaption);

export const useFigure = createHook("useFigure");
export const Figure = unstable_createComponent("figure", useFigure);

export const useFooter = createHook("useFooter");
export const Footer = unstable_createComponent("footer", useFooter);

export const useH1 = createHook("useH1");
export const H1 = unstable_createComponent("h1", useH1);

export const useH2 = createHook("useH2");
export const H2 = unstable_createComponent("h2", useH2);

export const useH3 = createHook("useH3");
export const H3 = unstable_createComponent("h3", useH3);

export const useH4 = createHook("useH4");
export const H4 = unstable_createComponent("h4", useH4);

export const useH5 = createHook("useH5");
export const H5 = unstable_createComponent("h5", useH5);

export const useH6 = createHook("useH6");
export const H6 = unstable_createComponent("h6", useH6);

export const useHeader = createHook("useHeader");
export const Header = unstable_createComponent("header", useHeader);

export const useHgroup = createHook("useHgroup");
export const Hgroup = unstable_createComponent("hgroup", useHgroup);

export const useHr = createHook("useHr");
export const Hr = unstable_createComponent("hr", useHr);

export const useImg = createHook("useImg");
export const Img = unstable_createComponent("img", useImg);

export const useInput = createHook("useInput");
export const Input = unstable_createComponent("input", useInput);

export const useIns = createHook("useIns");
export const Ins = unstable_createComponent("ins", useIns);

export const useKbd = createHook("useKbd");
export const Kbd = unstable_createComponent("kbd", useKbd);

export const useLabel = createHook("useLabel");
export const Label = unstable_createComponent("label", useLabel);

export const useLegend = createHook("useLegend");
export const Legend = unstable_createComponent("legend", useLegend);

export const useLi = createHook("useLi");
export const Li = unstable_createComponent("li", useLi);

export const useMark = createHook("useMark");
export const Mark = unstable_createComponent("mark", useMark);

export const useNav = createHook("useNav");
export const Nav = unstable_createComponent("nav", useNav);

export const useOl = createHook("useOl");
export const Ol = unstable_createComponent("ol", useOl);

export const useP = createHook("useP");
export const P = unstable_createComponent("p", useP);

export const usePre = createHook("usePre");
export const Pre = unstable_createComponent("pre", usePre);

export const useSelect = createHook("useSelect");
export const Select = unstable_createComponent("select", useSelect);

export const useSpan = createHook("useSpan");
export const Span = unstable_createComponent("span", useSpan);

export const useSummary = createHook("useSummary");
export const Summary = unstable_createComponent("summary", useSummary);

export const useTable = createHook("useTable");
export const Table = unstable_createComponent("table", useTable);

export const useTbody = createHook("useTbody");
export const Tbody = unstable_createComponent("tbody", useTbody);

export const useTd = createHook("useTd");
export const Td = unstable_createComponent("td", useTd);

export const useTextarea = createHook("useTextarea");
export const Textarea = unstable_createComponent("textarea", useTextarea);

export const useTfoot = createHook("useTfoot");
export const Tfoot = unstable_createComponent("tfoot", useTfoot);

export const useTh = createHook("useTh");
export const Th = unstable_createComponent("th", useTh);

export const useThead = createHook("useThead");
export const Thead = unstable_createComponent("thead", useThead);

export const useTr = createHook("useTr");
export const Tr = unstable_createComponent("tr", useTr);

export const useUl = createHook("useUl");
export const Ul = unstable_createComponent("ul", useUl);
