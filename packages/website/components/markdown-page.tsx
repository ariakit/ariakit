import { Fragment, createElement, useMemo } from "react";
import { PlaygroundCode } from "ariakit-playground/playground-code";
import theme from "ariakit-playground/themes/vscode-dark";
import RehypeReact from "rehype-react";
import { visit } from "unist-util-visit";
import styles from "./markdown-page.module.scss";
import Playground from "./playground";

// @ts-ignore
const { Compiler: renderAst } = new RehypeReact({
  createElement,
  Fragment: Fragment,
  components: {
    // TODO: Refactor
    p: (props) => {
      const [child] = props.children;
      if (child.props && "data-playground" in child.props) {
        return <>{props.children}</>;
      }
      return <p {...props} />;
    },
    pre: (props) => {
      const [child] = props.children;
      if (child.type === "code") {
        return (
          <PlaygroundCode
            highlight
            className={theme}
            value={child.props.children[0]}
            language={child.props.className?.replace("language-", "")}
          />
        );
      }
      return <pre {...props} />;
    },
    a: (props) => {
      if ("data-playground" in props) {
        // const key = Object.values(props.defaultValues).join("");
        return (
          <Playground
            // key={key}
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
  return (
    <div className="ak-col ak-gap-2 ak-center">
      <div
        style={{
          position: "fixed",
          height: 60,
          width: "100%",
          background: "var(--color-bg-4)",
          top: 0,
          left: 0,
          zIndex: 998,
          borderBottom: "1px solid var(--color-bg-4-border)",
        }}
      />
      <div
        className={styles["wrapper"]}
        style={{
          position: "relative",
          width: "100%",
          padding: "80px 16px",
          maxWidth: 952,
        }}
      >
        {renderAst(props.markdown)}
      </div>
    </div>
  );
}
