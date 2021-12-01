import {
  ElementType,
  MouseEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useControlledState,
  useEventCallback,
  useForkRef,
  useSafeLayoutEffect,
  useWrapElement,
} from "ariakit-utils/hooks";
import { cx } from "ariakit-utils/misc";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Options, Props, SetState } from "ariakit-utils/types";
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
    ...props
  }) => {
    state = useStore(state || PlaygroundContext, [
      useCallback((s: PlaygroundState) => getValue(s, file), [file]),
    ]);
    const ref = useRef<HTMLDivElement>(null);
    const value = valueProp ?? getValue(state, file);
    const [collapsible, setCollapsible] = useState(false);

    const [expanded, setExpanded] = useControlledState(
      defaultExpanded ?? !maxHeight,
      expandedProp,
      setExpandedProp
    );

    if (language === "js") {
      language = "jsx";
    }

    useSafeLayoutEffect(() => {
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

    const onMouseDownCaptureProp = useEventCallback(props.onMouseDownCapture);

    const onMouseDownCapture = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        onMouseDownCaptureProp(event);
        if (event.defaultPrevented) return;
        setExpanded(true);
      },
      [onMouseDownCaptureProp]
    );

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
      [collapsible, expanded, disclosureProps, disclosureOnClick]
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
  setExpanded?: SetState<boolean>;
  defaultExpanded?: boolean;
};

export type PlaygroundCodeProps<T extends As = "div"> = Props<
  PlaygroundCodeOptions<T>
>;
