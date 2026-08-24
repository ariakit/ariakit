import {
  useId,
  useSafeLayoutEffect,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import { hasOwnProperty } from "@ariakit/utils";
import type { ElementType, ReactNode } from "react";
import { isValidElement, useContext } from "react";
import {
  NotificationHeadingContext,
  NotificationItemContext,
} from "./__notification-context.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

function hasContent(children: ReactNode): boolean {
  if (Array.isArray(children)) {
    return children.some(hasContent);
  }
  if (typeof children === "string") {
    return !!children.trim();
  }
  if (children == null || typeof children === "boolean") {
    return false;
  }
  return true;
}

interface ContentProps {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  children?: ReactNode;
  dangerouslySetInnerHTML?: { __html: string | TrustedHTML };
  title?: string;
}

function hasText(value: string | undefined) {
  return !!value?.trim();
}

function hasInnerHTML(props: ContentProps) {
  const html = props.dangerouslySetInnerHTML?.__html;
  if (html == null) return false;
  if (typeof html === "string") {
    return !!html.trim();
  }
  return true;
}

function hasPropsContent(props: ContentProps) {
  return (
    hasContent(props.children) ||
    hasText(props["aria-label"]) ||
    hasText(props["aria-labelledby"]) ||
    hasText(props.title) ||
    hasInnerHTML(props)
  );
}

function hasRenderContent(render: unknown) {
  if (!isValidElement<ContentProps>(render)) return false;
  return hasPropsContent(render.props);
}

/** Returns props to create a NotificationHeading component. */
export const useNotificationHeading = createHook<
  TagName,
  NotificationHeadingOptions
>(function useNotificationHeading(props) {
  const item = useContext(NotificationItemContext);
  const setHeadingId = useContext(NotificationHeadingContext);
  const id = useId(props.id);
  const children = hasOwnProperty(props, "children")
    ? props.children
    : item?.heading;
  const hasHeading =
    hasContent(children) ||
    hasText(props["aria-label"]) ||
    hasText(props["aria-labelledby"]) ||
    hasText(props.title) ||
    hasInnerHTML(props) ||
    hasRenderContent(props.render);

  useSafeLayoutEffect(() => {
    setHeadingId?.(hasHeading ? id : undefined);
    return () => setHeadingId?.(undefined);
  }, [setHeadingId, id, hasHeading]);

  return {
    ...props,
    children,
    id,
  };
});

/** Renders a notification heading without adding a document heading level. */
export const NotificationHeading = forwardRef(function NotificationHeading(
  props: NotificationHeadingProps,
) {
  const htmlProps = useNotificationHeading(props);
  return createElement(TagName, htmlProps);
});

export interface NotificationHeadingOptions<
  _T extends ElementType = TagName,
> extends Options {}

export type NotificationHeadingProps<T extends ElementType = TagName> = Props<
  T,
  NotificationHeadingOptions<T>
>;
