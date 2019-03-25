import { useHook } from "reakit/system/useHook";
import { unstable_createComponent } from "reakit/utils/createComponent";
import { useBox, unstable_BoxOptions, unstable_BoxProps } from "reakit/Box/Box";

function createHook(hookName: string) {
  const useElement = (
    options: unstable_BoxOptions = {},
    props: unstable_BoxProps = {}
  ) => {
    props = useBox(options, props);
    props = useHook(hookName, options, props);
    return props;
  };

  useElement.__keys = useBox.__keys;

  Object.defineProperty(useElement, "name", {
    value: hookName
  });

  return useElement;
}

export const useA = createHook("useA");
export const A = unstable_createComponent({ as: "a", useHook: useA });

export const useBlockquote = createHook("useBlockquote");
export const Blockquote = unstable_createComponent({
  as: "blockquote",
  useHook: useBlockquote
});

export const useButton = createHook("useButton");
export const Button = unstable_createComponent({
  as: "button",
  useHook: useButton
});

export const useCaption = createHook("useCaption");
export const Caption = unstable_createComponent({
  as: "caption",
  useHook: useCaption
});

export const useCite = createHook("useCite");
export const Cite = unstable_createComponent({ as: "cite", useHook: useCite });

export const useCode = createHook("useCode");
export const Code = unstable_createComponent({ as: "code", useHook: useCode });

export const useDd = createHook("useDd");
export const Dd = unstable_createComponent({ as: "dd", useHook: useDd });

export const useDiv = createHook("useDiv");
export const Div = unstable_createComponent({ as: "div", useHook: useDiv });

export const useDl = createHook("useDl");
export const Dl = unstable_createComponent({ as: "dl", useHook: useDl });

export const useDt = createHook("useDt");
export const Dt = unstable_createComponent({ as: "dt", useHook: useDt });

export const useFieldset = createHook("useFieldset");
export const Fieldset = unstable_createComponent({
  as: "fieldset",
  useHook: useFieldset
});

export const useFigcaption = createHook("useFigcaption");
export const Figcaption = unstable_createComponent({
  as: "figcaption",
  useHook: useFigcaption
});

export const useFigure = createHook("useFigure");
export const Figure = unstable_createComponent({
  as: "figure",
  useHook: useFigure
});

export const useFooter = createHook("useFooter");
export const Footer = unstable_createComponent({
  as: "footer",
  useHook: useFooter
});

export const useH1 = createHook("useH1");
export const H1 = unstable_createComponent({ as: "h1", useHook: useH1 });

export const useH2 = createHook("useH2");
export const H2 = unstable_createComponent({ as: "h2", useHook: useH2 });

export const useH3 = createHook("useH3");
export const H3 = unstable_createComponent({ as: "h3", useHook: useH3 });

export const useH4 = createHook("useH4");
export const H4 = unstable_createComponent({ as: "h4", useHook: useH4 });

export const useH5 = createHook("useH5");
export const H5 = unstable_createComponent({ as: "h5", useHook: useH5 });

export const useH6 = createHook("useH6");
export const H6 = unstable_createComponent({ as: "h6", useHook: useH6 });

export const useHeader = createHook("useHeader");
export const Header = unstable_createComponent({
  as: "header",
  useHook: useHeader
});

export const useHgroup = createHook("useHgroup");
export const Hgroup = unstable_createComponent({
  as: "hgroup",
  useHook: useHgroup
});

export const useHr = createHook("useHr");
export const Hr = unstable_createComponent({ as: "hr", useHook: useHr });

export const useImg = createHook("useImg");
export const Img = unstable_createComponent({ as: "img", useHook: useImg });

export const useInput = createHook("useInput");
export const Input = unstable_createComponent({
  as: "input",
  useHook: useInput
});

export const useIns = createHook("useIns");
export const Ins = unstable_createComponent({ as: "ins", useHook: useIns });

export const useKbd = createHook("useKbd");
export const Kbd = unstable_createComponent({ as: "kbd", useHook: useKbd });

export const useLabel = createHook("useLabel");
export const Label = unstable_createComponent({
  as: "label",
  useHook: useLabel
});

export const useLegend = createHook("useLegend");
export const Legend = unstable_createComponent({
  as: "legend",
  useHook: useLegend
});

export const useLi = createHook("useLi");
export const Li = unstable_createComponent({ as: "li", useHook: useLi });

export const useMark = createHook("useMark");
export const Mark = unstable_createComponent({ as: "mark", useHook: useMark });

export const useNav = createHook("useNav");
export const Nav = unstable_createComponent({ as: "nav", useHook: useNav });

export const useOl = createHook("useOl");
export const Ol = unstable_createComponent({ as: "ol", useHook: useOl });

export const useP = createHook("useP");
export const P = unstable_createComponent({ as: "p", useHook: useP });

export const usePre = createHook("usePre");
export const Pre = unstable_createComponent({ as: "pre", useHook: usePre });

export const useSelect = createHook("useSelect");
export const Select = unstable_createComponent({
  as: "select",
  useHook: useSelect
});

export const useSpan = createHook("useSpan");
export const Span = unstable_createComponent({ as: "span", useHook: useSpan });

export const useSummary = createHook("useSummary");
export const Summary = unstable_createComponent({
  as: "summary",
  useHook: useSummary
});

export const useTable = createHook("useTable");
export const Table = unstable_createComponent({
  as: "table",
  useHook: useTable
});

export const useTbody = createHook("useTbody");
export const Tbody = unstable_createComponent({
  as: "tbody",
  useHook: useTbody
});

export const useTd = createHook("useTd");
export const Td = unstable_createComponent({ as: "td", useHook: useTd });

export const useTextarea = createHook("useTextarea");
export const Textarea = unstable_createComponent({
  as: "textarea",
  useHook: useTextarea
});

export const useTfoot = createHook("useTfoot");
export const Tfoot = unstable_createComponent({
  as: "tfoot",
  useHook: useTfoot
});

export const useTh = createHook("useTh");
export const Th = unstable_createComponent({ as: "th", useHook: useTh });

export const useThead = createHook("useThead");
export const Thead = unstable_createComponent({
  as: "thead",
  useHook: useThead
});

export const useTr = createHook("useTr");
export const Tr = unstable_createComponent({ as: "tr", useHook: useTr });

export const useUl = createHook("useUl");
export const Ul = unstable_createComponent({ as: "ul", useHook: useUl });
