import {
  ElementType,
  MouseEvent,
  cloneElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ClassNames, SerializedStyles } from "@emotion/react";
import {
  useControlledState,
  useEvent,
  useForkRef,
  useWrapElement,
} from "ariakit-utils/hooks";
import { cx } from "ariakit-utils/misc";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { Button, ButtonProps } from "ariakit/button";
import { highlight, languages } from "prismjs";
import { getExtension } from "./__utils/get-extension";
import { getValue } from "./__utils/get-value";
import { PlaygroundContext } from "./__utils/playground-context";
import { PlaygroundState } from "./playground-state";

import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";

export const usePlaygroundCode = createHook<PlaygroundCodeOptions>(
  ({
    state,
    file,
    lineNumbers,
    highlight: shouldHighlight = true,
    maxHeight,
    value: valueProp,
    language = getExtension(file),
    disclosureProps,
    defaultExpanded,
    expanded: expandedProp,
    setExpanded: setExpandedProp,
    theme,
    ...props
  }) => {
    state = useStore(state || PlaygroundContext, [
      useCallback((s: PlaygroundState) => getValue(s, file), [file]),
    ]);
    const ref = useRef<HTMLDivElement>(null);
    const value = valueProp ?? getValue(state, file);

    const length = value ? value.split("\n").length : 0;
    // TODO: Make this a prop?
    const [collapsible, setCollapsible] = useState(
      maxHeight ? length >= (maxHeight - 32) / 21 : false
    );

    const [expanded, setExpanded] = useControlledState(
      defaultExpanded ?? !maxHeight,
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
      if (typeof ResizeObserver !== "function") return;
      const observer = new ResizeObserver(() => {
        setCollapsible(scrollerElement.scrollHeight > maxHeight);
      });
      observer.observe(scrollerElement);
      return () => observer.disconnect();
    }, [maxHeight, props.children]);

    const code = useMemo(() => {
      if (!shouldHighlight) return;
      if (!language) return;
      if (!value) return;
      const languageObj = languages[language];
      if (!languageObj) return;
      return highlight(value, languageObj, language);
    }, [shouldHighlight, language, value]);

    const lines = Array.from({ length }, (_, i) => i + 1);

    const numbers = useMemo(
      () =>
        lineNumbers && (
          <div className="cm-gutters" aria-hidden>
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

    const onMouseDownCaptureProp = props.onMouseDownCapture;

    const onMouseDownCapture = useEvent((event: MouseEvent<HTMLDivElement>) => {
      onMouseDownCaptureProp?.(event);
      if (event.defaultPrevented) return;
      setExpanded(true);
    });

    const disclosureOnClickProp = disclosureProps?.onClick;

    const disclosureOnClick = useEvent(
      (event: MouseEvent<HTMLButtonElement>) => {
        disclosureOnClickProp?.(event);
        if (event.defaultPrevented) return;
        event.stopPropagation();
        if (!expanded) {
          ref.current?.querySelector<HTMLElement>(".cm-content")?.focus();
        }
        setExpanded(!expanded);
      }
    );

    props = useWrapElement(
      props,
      (element) => (
        <>
          {element && (
            <ClassNames>
              {({ css, cx }) =>
                cloneElement(element, {
                  className: cx(css(theme), element.props.className),
                })
              }
            </ClassNames>
          )}
          {collapsible && (
            <Button
              aria-expanded={expanded}
              children={expanded ? "Collapse code" : "Expand code"}
              {...disclosureProps}
              as={disclosureProps?.as || "button"}
              onClick={disclosureOnClick}
            />
          )}
        </>
      ),
      [theme, collapsible, expanded, disclosureProps, disclosureOnClick]
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
              <code
                className="cm-content"
                dangerouslySetInnerHTML={{ __html: code }}
              />
            ) : (
              <code className="cm-content">{value}</code>
            )}
          </pre>
        </div>
      ),
      [numbers, code, value]
    );

    const className = cx(
      language && `code-${language}`,
      lineNumbers && "has-line-numbers",
      props.className
    );

    props = {
      children,
      ...props,
      ref: useForkRef(ref, props.ref),
      onMouseDownCapture,
      className,
      style: {
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
  disclosureProps?: ButtonProps<ElementType>;
  expanded?: boolean;
  setExpanded?: (expanded: boolean) => void;
  defaultExpanded?: boolean;
  theme?: SerializedStyles;
};

export type PlaygroundCodeProps<T extends As = "div"> = Props<
  PlaygroundCodeOptions<T>
>;
