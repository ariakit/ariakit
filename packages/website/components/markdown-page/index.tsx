// TODO: Refactor this entire page
import { Fragment, createElement, useMemo } from "react";
import { PlaygroundCode } from "ariakit-playground/playground-code";
import theme from "ariakit-playground/themes/vscode";
import { cx } from "ariakit-utils/misc";
import Link from "next/link";
import RehypeReact from "rehype-react";
import { visit } from "unist-util-visit";
import NewWindow from "../icons/new-window";
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
            className="bg-canvas-1 dark:bg-canvas-1-dark rounded-xl !max-w-[800px]"
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
      if (href?.startsWith("http")) {
        return (
          <a
            href={href}
            {...props}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="inline-flex items-center gap-1"
          >
            <span>{props.children}</span>
            <NewWindow className="stroke-black/60 dark:stroke-white/60 h-[1em] w-[1em]" />
          </a>
        );
      } else if (href) {
        return (
          <Link href={href}>
            <a {...props} />
          </Link>
        );
      }
      return <a {...props} />;
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
    <div className="flex flex-col md:flex-row-reverse items-start justify-center">
      <SEO title={`${title} - Ariakit`} />
      <div className="md:sticky md:top-24 md:mt-[100px] flex flex-col gap-4 p-4 w-[240px]">
        <div className="uppercase text-xs font-bold text-black/60 dark:text-white/50">
          On this page
        </div>
        <ul className="flex flex-col gap-2 text-sm [&>li]:opacity-80">
          <li>
            <a href="#">Combobox</a>
          </li>
          <li className="font-bold !opacity-100">Installation</li>
          <li>Features</li>
          <li>API</li>
          <li>Examples</li>
          <li>Other components</li>
        </ul>
      </div>
      <div
        className={cx(
          "flex min-w-[1px] flex-col gap-8 items-center",
          "relative w-full max-w-5xl mt-8 sm:mt-12 px-3 sm:px-4 lg:px-8",
          // all
          "[&>*]:w-full [&>*]:max-w-3xl",
          // links
          "[&_a]:rounded-sm [&_a:focus-visible]:ariakit-outline-input [&_a:focus-visible]:no-underline",
          "[&_a]:underline [&_a:hover]:decoration-[3px] [&_a]:[text-decoration-skip-ink:none]",
          "[&_a]:underline-offset-[0.125em]",
          "[&_a]:font-medium dark:[&_a]:font-normal",
          "[&_a]:text-link dark:[&_a]:text-link-dark",
          // h1
          "[&_h1]:scroll-mt-[120px]",
          "[&_h1]:text-4xl sm:[&_h1]:text-5xl",
          "[&_h1]:font-extrabold dark:[&_h1]:font-bold",
          "[&_h1]:tracking-[-0.035em] dark:[&_h1]:tracking-[-0.015em]",
          // h2
          "[&_h2]:mt-6",
          "[&_h2]:scroll-mt-24",
          "[&_h2]:text-2xl sm:[&_h2]:text-3xl",
          "[&_h2]:font-semibold dark:[&_h2]:font-medium",
          "[&_h2]:text-black/70 dark:[&_h2]:text-white/60",
          "[&_h2]:tracking-[-0.035em] dark:[&_h2]:tracking-[-0.015em]",
          // h3
          "[&_h3]:mt-2",
          "[&_h3]:scroll-mt-20",
          "[&_h3]:text-xl",
          "[&_h3]:font-semibold dark:[&_h3]:font-medium",
          "[&_h3]:text-black dark:[&_h3]:text-white",
          "[&_h3]:tracking-[-0.035em] dark:[&_h3]:tracking-[-0.015em]",
          // description
          "[&>p.description]:-translate-y-4",
          "[&>p.description]:text-lg",
          "[&>p.description]:text-black/70 dark:[&>p.description]:text-white/60",
          "[&>p.description]:!tracking-tight",
          // warning
          "[&>div.warning]:relative [&>div.warning]:p-4 [&>div.warning]:pl-8",
          "[&>div.warning]:rounded-xl [&>div.warning]:text-black/80 dark:[&>div.warning]:text-white/80",
          "[&>div.warning]:border [&>div.warning]:border-canvas-5 dark:[&>div.warning]:border-canvas-2-dark",
          "[&>div.warning]:shadow dark:[&>div.warning]:shadow-dark",
          "[&>div.warning]:bg-canvas-5 dark:[&>div.warning]:bg-canvas-3-dark",
          "[&>div.warning>h2]:m-0 [&>div.warning>h2]:text-xl [&>div.warning>h2]:mb-4",
          "[&>div.warning]:before:absolute [&>div.warning]:before:top-2 [&>div.warning]:before:left-2 [&>div.warning]:before:w-1.5 dark:[&>div.warning]:before:w-1.5 [&>div.warning]:before:bottom-2 [&>div.warning]:before:rounded-lg [&>div.warning]:before:bg-warn-2 dark:[&>div.warning]:before:bg-warn-2-dark",
          "[&>div.warning>h3]:mb-2 [&>div.warning>h3]:font-medium [&>div.warning>h3]:text-lg [&>div.warning>h3]:text-warn-1 dark:[&>div.warning>h3]:text-warn-1-dark",
          // p
          "dark:[&>p]:text-white/80",
          "[&>p]:tracking-[-0.02em] dark:[&>p]:tracking-[-0.01em] [&>p]:leading-7",
          // code
          "[&_p_code]:p-1 [&_p_code]:text-[0.9375em] [&_p_code]:rounded",
          "[&_p_code]:bg-black/[6.5%] dark:[&_p_code]:bg-white/[6.5%]",
          "[&_p_code]:font-monospace"
        )}
      >
        {renderAst(tree)}
      </div>
    </div>
  );
}
