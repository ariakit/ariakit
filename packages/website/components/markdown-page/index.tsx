// TODO: Refactor this entire page
import { Fragment, createElement, useMemo } from "react";
import { PlaygroundCode } from "ariakit-playground/playground-code";
import theme from "ariakit-playground/themes/vscode-dark";
import { cx } from "ariakit-utils/misc";
import RehypeReact from "rehype-react";
import { visit } from "unist-util-visit";
import Playground from "../playground";
import SEO from "../seo";

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
  const title = useMemo(() => {
    let value = "";
    visit(props.markdown, "element", (node) => {
      if (value) return;
      if (node.tagName !== "h1") return;
      value = node.children[0].value;
    });
    return value;
  }, [props.markdown]);

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
    <div className="flex items-start justify-center">
      <SEO title={`${title} - Ariakit`} />
      <div
        className={cx(
          "flex flex-col gap-8 items-center",
          "relative w-full max-w-5xl mt-8 sm:mt-12 px-3 sm:px-4 md:px-8",
          "tracking-[-0.035em] dark:tracking-[-0.015em]",
          // all
          "[&>*]:w-full [&>*]:max-w-3xl",
          // links
          "[&_a]:rounded-sm [&_a:focus-visible]:ariakit-outline [&_a:focus-visible]:no-underline",
          "[&_a]:underline [&_a:hover]:decoration-[3px] [&_a]:[text-decoration-skip-ink:none]",
          "[&_a]:text-link dark:[&_a]:text-link-dark",
          // h1
          "[&_h1]:scroll-mt-[72px]",
          "[&_h1]:text-4xl sm:[&_h1]:text-5xl md:[&_h1]:text-6xl",
          "[&_h1]:font-extrabold dark:[&_h1]:font-bold",
          // h2
          "[&_h2]:mt-6",
          "[&_h2]:text-2xl sm:[&_h2]:text-3xl md:[&_h2]:text-4xl",
          "[&_h2]:font-semibold dark:[&_h2]:font-medium",
          "[&_h2]:text-black/75 dark:[&_h2]:text-white/75",
          // description
          "[&>p.description]:text-lg",
          "[&>p.description]:text-canvas-1/70 dark:[&>p.description]:text-canvas-1-dark/70",
          // p
          "[&_p]:tracking-tight"
        )}
      >
        {renderAst(tree)}
      </div>
      <div className="sticky top-24 mt-20">
        <div>On this page</div>
        <ul>
          <li>Form with Select</li>
          <li>Features</li>
          <li>Related components</li>
          <li>Other examples</li>
        </ul>
      </div>
    </div>
  );
}
