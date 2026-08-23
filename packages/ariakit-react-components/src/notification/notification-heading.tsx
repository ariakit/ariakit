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
  NotificationHeadingContext,
  NotificationItemContext,
} from "./__notification-context.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/** Returns props to create a NotificationHeading component. */
export const useNotificationHeading = createHook<
  TagName,
  NotificationHeadingOptions
>(function useNotificationHeading(props) {
  const item = useContext(NotificationItemContext);
  const setHeadingId = useContext(NotificationHeadingContext);
  const id = useId(props.id);

  useSafeLayoutEffect(() => {
    setHeadingId?.(id);
    return () => setHeadingId?.(undefined);
  }, [setHeadingId, id]);

  return {
    children: item?.heading,
    ...props,
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
