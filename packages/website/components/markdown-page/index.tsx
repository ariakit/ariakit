// TODO: Refactor this entire page
import { Fragment, createElement, useEffect, useMemo, useState } from "react";
import { PlaygroundCode } from "ariakit-playground/playground-code";
import theme from "ariakit-playground/themes/vscode";
import { cx } from "ariakit-utils/misc";
import Link from "next/link";
import RehypeReact from "rehype-react";
import { visit } from "unist-util-visit";
import Hashtag from "../icons/hashtag";
import NewWindow from "../icons/new-window";
import Playground from "../playground";
import SEO from "../seo";

type TableOfContents = Array<{
  id: string;
  text: string;
  children?: TableOfContents;
}>;

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
            className={cx(
              "!max-w-[832px] rounded-xl bg-gray-150 dark:bg-gray-850 md:[&_.cm-scroller]:!p-8",
              child.props.children[0].trim().split(`\n`).length === 1 &&
                "md:[&_.cm-scroller]:!py-4"
            )}
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
            <NewWindow className="h-[1em] w-[1em] stroke-black/60 dark:stroke-white/60" />
          </a>
        );
      } else if (href?.startsWith("#")) {
        return (
          <Link href={href}>
            <a {...props} className="inline-flex flex-row-reverse items-center">
              <span>{props.children}</span>
              <Hashtag className="h-[1em] w-[1em] stroke-black/60 dark:stroke-white/60" />
            </a>
          </Link>
        );
      } else if (href?.startsWith("/api-reference")) {
        return <span>{props.children}</span>;
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

  const tableOfContents = tree.data.tableOfContents as TableOfContents;

  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const onScroll = () => {
      const ids = tableOfContents
        .map((item) => [
          item.id,
          ...(item.children?.map((child) => child.id) || []),
        ])
        .flat()
        .reverse();
      const activeId = ids.find((id) => {
        const element = document.getElementById(id);
        if (!element) return false;
        const { top } = element.getBoundingClientRect();
        const { scrollMarginTop } = getComputedStyle(element);
        return top - parseInt(scrollMarginTop) <= 0;
      });
      if (activeId) {
        setActiveId(activeId);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [tableOfContents]);

  return (
    <div className="flex flex-col items-start justify-center md:flex-row-reverse">
      <SEO title={`${title} - Ariakit`} />
      {tableOfContents && (
        <nav className="flex w-[256px] flex-col gap-4 p-4 md:sticky md:top-24 md:mt-[100px]">
          <div className="text-xs font-bold uppercase text-black/60 dark:text-white/50">
            On this page
          </div>
          <ul className="flex flex-col gap-2 text-sm [&>li]:opacity-80">
            <li className={cx(!activeId && "font-bold !opacity-100")}>
              <Link href="#">Introduction</Link>
            </li>
            {tableOfContents.map((item) => (
              <li
                key={item.id}
                className={cx(activeId === item.id && "font-bold !opacity-100")}
              >
                <Link href={`#${item.id}`}>{item.text}</Link>
                {item.children && (
                  <ul className="mt-2 flex flex-col gap-2 pl-4">
                    {item.children.map((item) => (
                      <li
                        key={item.id}
                        className={cx(
                          activeId === item.id
                            ? "font-bold !opacity-100"
                            : "!font-normal !opacity-80"
                        )}
                      >
                        <Link href={`#${item.id}`}>{item.text}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div
        className={cx(
          "flex min-w-[1px] flex-col items-center gap-8",
          "relative mt-8 w-full max-w-5xl px-3 sm:mt-12 sm:px-4 lg:px-8",
          // all
          "[&>*]:w-full [&>*]:max-w-3xl",
          // links
          "[&_a]:rounded-sm [&_a:focus-visible]:no-underline [&_a:focus-visible]:ariakit-outline-input",
          "[&_a]:underline [&_a]:[text-decoration-skip-ink:none] [&_a:hover]:decoration-[3px]",
          "[&_a]:underline-offset-[0.125em]",
          "[&_a]:font-medium dark:[&_a]:font-normal",
          "[&_a]:text-blue-700 dark:[&_a]:text-blue-400",
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
          "[&_h3]:scroll-mt-24",
          "[&_h3]:text-xl",
          "[&_h3]:font-semibold dark:[&_h3]:font-medium",
          "[&_h3]:text-black dark:[&_h3]:text-white",
          "[&_h3]:tracking-[-0.035em] dark:[&_h3]:tracking-[-0.015em]",
          // description
          "[&>p[data-description]]:-translate-y-4",
          "[&>p[data-description]]:text-lg",
          "[&>p[data-description]]:text-black/70 dark:[&>p[data-description]]:text-white/60",
          "[&>p[data-description]]:!tracking-tight",
          // warning
          "[&>div.warning]:relative [&>div.warning]:p-4 [&>div.warning]:pl-8",
          "[&>div.warning]:rounded-xl [&>div.warning]:text-black/80 dark:[&>div.warning]:text-white/80",
          "[&>div.warning]:border [&>div.warning]:border-gray-250 dark:[&>div.warning]:border-gray-600",
          "[&>div.warning]:shadow dark:[&>div.warning]:shadow-dark",
          "[&>div.warning]:bg-white dark:[&>div.warning]:bg-gray-750",
          "[&>div.warning>h2]:m-0 [&>div.warning>h2]:mb-4 [&>div.warning>h2]:text-xl",
          "[&>div.warning]:before:absolute [&>div.warning]:before:top-2 [&>div.warning]:before:left-2 [&>div.warning]:before:bottom-2 [&>div.warning]:before:w-1.5 [&>div.warning]:before:rounded-lg [&>div.warning]:before:bg-warn-2 dark:[&>div.warning]:before:w-1.5 dark:[&>div.warning]:before:bg-warn-2-dark",
          "[&>div.warning>h3]:mb-2 [&>div.warning>h3]:text-lg [&>div.warning>h3]:font-medium [&>div.warning>h3]:text-warn-1 dark:[&>div.warning>h3]:text-warn-1-dark",
          // p
          "dark:[&>p]:text-white/80",
          "[&>p]:leading-7 [&>p]:tracking-[-0.02em] dark:[&>p]:tracking-[-0.01em]",
          // p strong
          "[&>p>strong]:font-semibold dark:[&>p>strong]:text-white",
          // code
          "[&_p_code]:rounded [&_p_code]:p-1 [&_p_code]:text-[0.9375em]",
          "[&_p_code]:bg-black/[6.5%] dark:[&_p_code]:bg-white/[6.5%]",
          "[&_p_code]:font-monospace",
          // api
          "[&_[data-api]]:leading-8 [&_[data-api]]:tracking-wide",
          "[&_[data-api]]:text-black/60 dark:[&_[data-api]]:text-white/60"
        )}
      >
        {renderAst(tree)}
      </div>
    </div>
  );
}
