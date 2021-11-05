import {
  ComponentPropsWithRef,
  ElementType,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useControlledState,
  useEventCallback,
  useForkRef,
  useWrapElement,
} from "ariakit-utils/hooks";
import { cx } from "ariakit-utils/misc";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Options, Props, SetState } from "ariakit-utils/types";
import { Button } from "ariakit/button";
import { highlight, languages } from "prismjs";
import { PlaygroundContext, getExtension, getValue } from "./__utils";
import { PlaygroundState } from "./playground-state";

export const usePlaygroundCode = createHook<PlaygroundCodeOptions>(
  ({
    state,
    file,
    lineNumbers,
    highlight: shouldHighlight = true,
    maxHeight = 150,
    value: valueProp,
    language = getExtension(file),
    disclosure,
    disclosureProps,
    defaultExpanded,
    expanded: expandedProp,
    setExpanded: setExpandedProp,
    ...props
  }) => {
    state = useStore(state || PlaygroundContext, [
      useCallback((s: PlaygroundState) => getValue(s, file), [file]),
    ]);
    const ref = useRef<HTMLDivElement>(null);
    const value = valueProp ?? getValue(state, file);
    const [collapsible, setCollapsible] = useState(false);

    const [expanded, setExpanded] = useControlledState(
      defaultExpanded ?? false,
      expandedProp,
      setExpandedProp
    );

    if (language === "js") {
      language = "jsx";
    }

    useEffect(() => {
      if (!maxHeight) return;
      const element = ref.current;
      if (!element) return;
      const scrollerElement = element.querySelector(".cm-scroller");
      if (!scrollerElement) return;
      setCollapsible(scrollerElement.scrollHeight > maxHeight);
    }, [maxHeight]);

    const code = useMemo(() => {
      if (!shouldHighlight) return;
      if (!language) return;
      if (!value) return;
      const languageObj = languages[language];
      if (!languageObj) return;
      return highlight(value, languageObj, language);
    }, [shouldHighlight, language, value]);

    const length = value ? value.split("\n").length : 0;
    const lines = Array.from({ length }, (_, i) => i + 1);

    const numbers = useMemo(
      () =>
        lineNumbers && (
          <div className="cm-gutters">
            <div className="cm-lineNumbers">
              {lines.map((line) => (
                <div key={line} className="cm-gutterElement">
                  {line}
                </div>
              ))}
            </div>
          </div>
        ),
      [lineNumbers, lines]
    );

    const className = cx(
      language && `code-${language}`,
      lineNumbers && "has-line-numbers",
      props.className
    );

    const onClickProp = useEventCallback(props.onClick);

    const onClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        setExpanded(true);
      },
      [onClickProp]
    );

    const Disclosure =
      typeof disclosure !== "boolean"
        ? disclosure || Button
        : disclosure
        ? Button
        : null;

    const disclosureOnClickProp = useEventCallback(disclosureProps?.onClick);

    const disclosureOnClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        disclosureOnClickProp(event);
        if (event.defaultPrevented) return;
        event.stopPropagation();
        if (!expanded) {
          ref.current?.querySelector<HTMLElement>(".cm-content")?.focus();
        }
        setExpanded(!expanded);
      },
      [disclosureOnClickProp, expanded]
    );

    props = useWrapElement(
      props,
      (element) => (
        <>
          {element}
          {collapsible && Disclosure && (
            <Disclosure
              aria-expanded={expanded}
              children={expanded ? "Collapse code" : "Expand code"}
              {...disclosureProps}
              onClick={disclosureOnClick}
              // style={{
              //   position: "absolute",
              //   bottom: expanded ? undefined : 0,
              //   top: expanded ? "100%" : undefined,
              //   padding: "16px 8px 8px",
              //   zIndex: 201,
              //   width: "100%",
              //   borderRadius: 0,
              //   borderBottomLeftRadius: "inherit",
              //   borderBottomRightRadius: "inherit",
              //   justifyContent: "center",
              //   color: "white",
              //   textDecoration: "underline",
              //   background: "linear-gradient(transparent, #1e1e1e 70%)",
              // }}
            />
          )}
        </>
      ),
      [collapsible, Disclosure, expanded, disclosureProps, disclosureOnClick]
    );

    const children = useMemo(
      () => (
        <div className="cm-editor">
          <pre
            className="cm-scroller"
            style={{ overflow: expanded ? "auto" : "hidden" }}
          >
            {numbers}
            {code ? (
              <code dangerouslySetInnerHTML={{ __html: code }} />
            ) : (
              <code>{value}</code>
            )}
          </pre>
        </div>
      ),
      [numbers, code, value]
    );

    props = {
      children,
      ...props,
      ref: useForkRef(ref, props.ref),
      onClick,
      className,
      style: {
        position: "relative",
        maxHeight: expanded ? undefined : maxHeight,
        ...props.style,
      },
    };

    return props;
  }
);

export const PlaygroundCode = createMemoComponent<PlaygroundCodeOptions>(
  (props) => {
    const htmlProps = usePlaygroundCode(props);
    return createElement("div", htmlProps);
  }
);

export type PlaygroundCodeOptions<T extends As = "div"> = Options<T> & {
  state?: PlaygroundState;
  file?: string;
  value?: string;
  language?: string;
  lineNumbers?: boolean;
  highlight?: boolean;
  maxHeight?: number;
  disclosure?: boolean | ElementType<ComponentPropsWithRef<"button">>;
  disclosureProps?: ComponentPropsWithRef<"button">;
  expanded?: boolean;
  setExpanded?: SetState<boolean>;
  defaultExpanded?: boolean;
};

export type PlaygroundCodeProps<T extends As = "div"> = Props<
  PlaygroundCodeOptions<T>
>;
