import {
  useId,
  useSafeLayoutEffect,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import type { ElementType } from "react";
import { useContext } from "react";
import {
  NotificationItemContext,
  NotificationMessageContext,
} from "./__notification-context.tsx";

const TagName = "p" satisfies ElementType;
type TagName = typeof TagName;

/** Returns props to create a NotificationMessage component. */
export const useNotificationMessage = createHook<
  TagName,
  NotificationMessageOptions
>(function useNotificationMessage(props) {
  const item = useContext(NotificationItemContext);
  const setMessageId = useContext(NotificationMessageContext);
  const id = useId(props.id);

  useSafeLayoutEffect(() => {
    setMessageId?.(id);
    return () => setMessageId?.(undefined);
  }, [setMessageId, id]);

  return {
    children: item?.message,
    ...props,
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
