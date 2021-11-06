import { createElement } from "react";
import RehypeReact from "rehype-react";

// @ts-ignore
const { Compiler: renderAst } = new RehypeReact({
  createElement,
  components: {
    a: (props) => <a {...props} />,
  },
});

export default function MarkdownPage(props) {
  // console.log(props);
  return <div>{renderAst(props.markdown)}</div>;
}
