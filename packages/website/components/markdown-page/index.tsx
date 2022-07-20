// TODO: Refactor this entire page
import { Fragment, createElement, useMemo } from "react";
import { PlaygroundCode } from "ariakit-playground/playground-code";
import theme from "ariakit-playground/themes/vscode-dark";
import { cx } from "ariakit-utils/misc";
import pkg from "ariakit/package.json";
import {
  Select,
  SelectItem,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import { VisuallyHidden } from "ariakit/visually-hidden";
import Link from "next/link";
import RehypeReact from "rehype-react";
import { visit } from "unist-util-visit";
import button from "../../styles/button";
import Playground from "../playground";
import SEO from "../seo";
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

  const select = useSelectState({ defaultValue: `v${pkg.version}` });

  return (
    <div className="flex flex-col items-center">
      <SEO title={`${title} - Ariakit`} />
      <div className="layer-2 fixed p-4 gap-4 top-0 left-0 z-40 flex w-full items-center bg-canvas-2 supports-backdrop-blur:bg-canvas-2/80 backdrop-blur dark:bg-canvas-2-dark dark:supports-backdrop-blur:bg-canvas-2-dark/80">
        <Link href="/">
          <a className="flex items-center gap-2 rounded-[9px] focus-visible:ariakit-outline">
            <VisuallyHidden>Ariakit</VisuallyHidden>
            <svg
              aria-hidden
              height="36"
              viewBox="0 0 48 48"
              className="fill-primary-2-foreground dark:fill-primary-2-dark-foreground"
            >
              <circle cx="29" cy="24" r="5" />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 4C7.58172 4 4 7.58172 4 12V36C4 40.4183 7.58172 44 12 44H36C40.4183 44 44 40.4183 44 36V12C44 7.58172 40.4183 4 36 4H12ZM23.9997 35.9997C30.6271 35.9997 35.9997 30.6271 35.9997 23.9997C35.9997 17.3723 30.6271 11.9997 23.9997 11.9997C17.3723 11.9997 11.9997 17.3723 11.9997 23.9997C11.9997 30.6271 17.3723 35.9997 23.9997 35.9997Z"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 0C5.37258 0 0 5.37258 0 12V36C0 42.6274 5.37258 48 12 48H36C42.6274 48 48 42.6274 48 36V12C48 5.37258 42.6274 0 36 0H12ZM12 2C6.47715 2 2 6.47715 2 12V36C2 41.5228 6.47715 46 12 46H36C41.5228 46 46 41.5228 46 36V12C46 6.47715 41.5228 2 36 2H12Z"
              />
            </svg>
          </a>
        </Link>
        <div className="flex gap-1 items-center">
          <Select
            state={select}
            className="flex items-center justify-center gap-1 whitespace-nowrap px-2 rounded-lg focus-visible:ariakit-outline-input text-xs font-semibold h-8 mr-2 text-black/80 bg-black/5 hover:bg-black/10 dark:text-white/80 dark:bg-white/5 dark:hover:bg-white/10 border-none"
          />
          <SelectPopover
            state={select}
            className={
              "rounded-lg border border-solid border-canvas-4 p-2 dark:border-canvas-4-dark bg-canvas-4 text-canvas-4 dark:bg-canvas-4-dark focus-visible:ariakit-outline dark:text-canvas-4-dark [&>*]:p-2"
            }
          >
            <SelectItem value="v2.0.0-next.34" />
            <SelectItem value="v1.3.10" />
          </SelectPopover>
          <div className="opacity-30 font-semibold">/</div>
          <button
            className={cx(
              button(),
              "rounded-lg h-8 px-2 focus-visible:ariakit-outline-input"
            )}
          >
            Examples
          </button>
          <div className="opacity-30 font-semibold">/</div>
          <button
            className={cx(
              button(),
              "rounded-lg h-8 px-2 focus-visible:ariakit-outline-input"
            )}
          >
            Button as link
          </button>
        </div>
        <button
          className={cx(button(), "ml-auto")}
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
        className={cx(
          styles["wrapper"],
          "relative w-full max-w-5xl gap-8 px-3 py-24 sm:px-4 md:px-8",
          // links
          "[&_a]:rounded-sm [&_a:focus-visible]:ariakit-outline",
          "[&_a]:underline [&_a:hover]:decoration-[3px] [&_a]:[text-decoration-skip-ink:none]",
          "[&_a]:text-link dark:[&_a]:text-link-dark"
        )}
      >
        {renderAst(tree)}
      </div>
    </div>
  );
}
