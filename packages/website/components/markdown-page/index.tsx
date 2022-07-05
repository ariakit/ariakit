// TODO: Refactor this entire page
import { Fragment, createElement, useMemo } from "react";
import { PlaygroundCode } from "ariakit-playground/playground-code";
import theme from "ariakit-playground/themes/vscode-dark";
import { cx } from "ariakit-utils/misc";
import Link from "next/link";
import RehypeReact from "rehype-react";
import { visit } from "unist-util-visit";
import Playground from "../playground";
import styles from "./style.module.css";

// @ts-ignore
const { Compiler: renderAst } = new RehypeReact({
  createElement,
  Fragment: Fragment,
  components: {
    p: (props) => {
      // @ts-ignore
      const [child] = props.children;
      if (child.props && "data-playground" in child.props) {
        return <>{props.children}</>;
      }
      return <p {...props} />;
    },
    pre: (props) => {
      // @ts-ignore
      const [child] = props.children;
      if (child.type === "code") {
        return (
          <PlaygroundCode
            highlight
            theme={theme}
            value={child.props.children[0]}
            language={child.props.className?.replace("language-", "")}
          />
        );
      }
      return <pre {...props} />;
    },
    a: ({ href, ...props }) => {
      if ("data-playground" in props) {
        // @ts-expect-error
        if (!props.defaultValues) return null;
        // @ts-expect-error
        return <Playground {...props} />;
      }
      return <a href={href} {...props} />;
    },
  },
});

// @ts-expect-error
export default function MarkdownPage(props) {
  const tree = useMemo(() => {
    visit(props.markdown, "element", (node) => {
      if (node.tagName !== "a") return;
      // @ts-expect-error
      if (!"dataPlayground" in node.properties) return;
      const href = node.properties.href;
      node.properties.defaultValues = props.defaultValues[href];
      node.properties.deps = props.deps[href];
    });
    return props.markdown;
  }, [props.markdown, props.defaultValues, props.deps]);
  return (
    <div className="flex flex-col items-center">
      <div
        className={cx(
          styles["header"],
          "layer-2 fixed top-0 left-0 z-40 flex justify-between h-16 w-full items-center",
          "border-b border-canvas-4 bg-canvas-4 p-4 dark:border-canvas-4-dark",
          "dark:bg-canvas-4-dark"
        )}
      >
        <Link href="/">
          <a>{"<"} Return Home</a>
        </Link>
        <button
          onClick={() => {
            if (document.documentElement.classList.contains("dark")) {
              document.documentElement.classList.remove("dark");
              document.documentElement.classList.add("light");
              localStorage.setItem("theme", "light");
            } else {
              document.documentElement.classList.remove("light");
              document.documentElement.classList.add("dark");
              localStorage.setItem("theme", "dark");
            }
          }}
        >
          Toggle dark mode
        </button>
      </div>
      <div
        className={`${styles["wrapper"]} relative w-full max-w-5xl gap-6 px-3 py-24 sm:px-4 md:px-8`}
      >
        {renderAst(tree)}
      </div>
    </div>
  );
}
