import { Fragment, createElement, useMemo } from "react";
import RehypeReact from "rehype-react";
import { visit } from "unist-util-visit";
import Playground from "./playground";

// @ts-ignore
const { Compiler: renderAst } = new RehypeReact({
  createElement,
  Fragment: Fragment,
  components: {
    p: (props) => {
      const [child] = props.children;
      if ("data-playground" in child.props) {
        return <>{props.children}</>;
      }
      return <p {...props} />;
    },
    a: (props) => {
      if ("data-playground" in props) {
        const key = Object.values(props.defaultValues).join("");
        return (
          <Playground
            key={key}
            defaultValues={props.defaultValues}
            deps={props.deps}
          />
        );
      }
      return <a {...props} />;
    },
  },
});

export default function MarkdownPage(props) {
  const tree = useMemo(() => {
    visit(props.markdown, "element", (node) => {
      if (node.tagName !== "a") return;
      if (!"dataPlayground" in node.properties) return;
      const href = node.properties.href;
      node.properties.defaultValues = props.defaultValues[href];
      node.properties.deps = props.deps[href];
    });
    return props.markdown;
  }, [props.markdown, props.defaultValues, props.deps]);
  return <div>{renderAst(props.markdown)}</div>;
}
