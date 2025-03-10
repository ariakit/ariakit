import {
  type CSSProperties,
  type HTMLAttributes,
  useEffect,
  useRef,
} from "react";
import { CopyToClipboard } from "../components/copy-to-clipboard.react.tsx";
import { Icon } from "../icons/icon.react.tsx";
import { cn } from "../lib/cn.ts";

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "lang"> {
  code: string;
  maxLines?: number;
  children?: React.ReactNode;
  filename?: string;
  filenameIcon?: string;
  showFilename?: boolean;
  lineNumbers?: boolean;
  highlightLines?: number[];
}

export function CodeBlockContainer({
  code,
  maxLines = 17,
  children,
  className,
  filename,
  lineNumbers = false,
  ...htmlProps
}: Props) {
  const lineCount = code.trimEnd().split("\n").length;
  const collapsible = lineCount > maxLines;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const collapse = () => {
    const collapsible = wrapperRef.current?.querySelector("[data-collapsible]");
    collapsible?.setAttribute("data-collapsed", "true");
    const expandButton =
      collapsible?.querySelector<HTMLElement>("[data-expand]");
    expandButton?.focus({ preventScroll: true });
    collapsible?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const pre = collapsible?.querySelector("pre");
    if (!pre) return;
    pre.inert = true;
  };

  const expand = () => {
    const wrapper = wrapperRef.current?.querySelector("[data-collapsible]");
    wrapper?.removeAttribute("data-collapsed");
    const pre = wrapper?.querySelector("pre");
    if (!pre) return;
    pre.inert = false;
    pre.focus({ preventScroll: true });
    wrapper?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  useEffect(() => {
    const pre = wrapperRef.current?.querySelector("pre");
    if (!pre) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        collapse();
      }
    };

    pre.addEventListener("keydown", handleKeyDown);
    return () => pre.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={cn("flex flex-col isolate scroll-my-2", className)}
      {...htmlProps}
    >
      <div
        className="ak-layer group peer ak-frame-border relative ak-frame-container/0 overflow-clip ak-tabs flex flex-col scroll-my-2"
        data-collapsible={collapsible || undefined}
        data-collapsed={collapsible || undefined}
      >
        <div
          data-filename={filename}
          className={cn(
            "ak-frame-cover/0 relative grid overflow-hidden",
            "has-[pre:focus-visible]:after:outline-2 after:ak-outline-primary after:absolute after:inset-0 after:z-3 after:pointer-events-none after:ak-frame after:-outline-offset-2",
            "not-in-[.ak-tab-panel]:ak-tab-panel",
          )}
        >
          <div className="absolute top-0 end-0 ak-frame-cover/1.5 z-2 pointer-events-none size-max">
            <CopyToClipboard
              text={code}
              data-single-line={lineCount === 1 || undefined}
              className="ring pointer-events-auto [@media(hover:hover)]:not-data-open:not-group-has-hover:not-group-has-focus-visible:sr-only"
            />
          </div>
          <pre
            // @ts-expect-error
            inert={collapsible ? "" : undefined}
            style={
              {
                "--max-lines": maxLines,
                "--line-height": "1.8em",
              } as CSSProperties
            }
            className={cn(
              "grid text-sm/(--line-height) ak-frame-cover/0 outline-none not-in-data-collapsed:overflow-auto *:*:ps-4 **:data-highlight:ak-edge/20 **:data-highlight:shadow-(color:--ak-border) **:data-highlight:shadow-[inset_0.175rem_0]",
              "max-h-[min(calc(100svh-12rem),60rem)] in-data-collapsed:max-h-[calc((var(--max-lines)+1)*var(--line-height))]",
              lineNumbers && "sm:grid-cols-[max-content_1fr]",
              lineCount === 1 ? "h-12 items-center" : "py-4",
            )}
          >
            {children}
          </pre>
          {collapsible && (
            <button
              data-expand
              className={cn(
                "absolute group/expand grid outline-none not-in-data-collapsed:hidden ak-frame-cover/4 py-2 inset-0 ak-layer-current bg-transparent bg-gradient-to-b from-transparent from-[calc(100%-8rem)] to-[calc(100%-0.5rem)] to-(--ak-layer) z-1 justify-center items-end",
              )}
              onClick={expand}
            >
              <div className="ak-button h-9 ak-layer-current text-sm/[1.5rem] border ak-dark:shadow group-hover/expand:ak-button_hover hover:ak-layer-pop-[1.5] group-focus-visible/expand:ak-button_focus group-active/expand:ak-button_active">
                Expand code
                <Icon className="text-base" name="chevronDown" />
              </div>
            </button>
          )}
        </div>
      </div>
      {collapsible && (
        <div className="sticky bottom-2 my-2 peer-data-collapsed:hidden grid justify-center">
          <button
            onClick={collapse}
            className="ak-button ak-layer h-9 text-sm/[1.5rem] border ak-dark:shadow"
          >
            Collapse code
            <Icon className="text-base" name="chevronUp" />
          </button>
        </div>
      )}
    </div>
  );
}
