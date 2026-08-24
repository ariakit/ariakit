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
  NotificationItemContext,
  NotificationMessageContext,
} from "./__notification-context.tsx";

const TagName = "p" satisfies ElementType;
type TagName = typeof TagName;

interface ContentProps {
  children?: ReactNode;
  dangerouslySetInnerHTML?: { __html: string | TrustedHTML };
}

function hasInnerHTMLValue(props: ContentProps) {
  return props.dangerouslySetInnerHTML?.__html != null;
}

function getRenderProps(render: unknown) {
  if (!isValidElement<ContentProps>(render)) return;
  return render.props;
}

/** Returns props to create a NotificationMessage component. */
export const useNotificationMessage = createHook<
  TagName,
  NotificationMessageOptions
>(function useNotificationMessage(props) {
  const item = useContext(NotificationItemContext);
  const setMessageId = useContext(NotificationMessageContext);
  const id = useId(props.id);
  const renderProps = getRenderProps(props.render);
  const hasAuthoredInnerHTML =
    hasInnerHTMLValue(props) ||
    (!!renderProps && hasInnerHTMLValue(renderProps));
  const children = hasOwnProperty(props, "children")
    ? props.children
    : hasAuthoredInnerHTML
      ? undefined
      : item?.message;

  useSafeLayoutEffect(() => {
    setMessageId?.(id);
    return () => setMessageId?.(undefined);
  }, [setMessageId, id]);

  return {
    "aria-label": hasAuthoredInnerHTML ? item?.message : undefined,
    ...props,
    children,
    id,
  };
});

/** Renders the notification message. */
export const NotificationMessage = forwardRef(function NotificationMessage(
  props: NotificationMessageProps,
) {
  const htmlProps = useNotificationMessage(props);
  return createElement(TagName, htmlProps);
});

export interface NotificationMessageOptions<
  _T extends ElementType = TagName,
> extends Options {}

export type NotificationMessageProps<T extends ElementType = TagName> = Props<
  T,
  NotificationMessageOptions<T>
>;
