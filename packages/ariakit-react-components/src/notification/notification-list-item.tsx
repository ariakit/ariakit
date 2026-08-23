import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import type { ElementType } from "react";

const TagName = "li" satisfies ElementType;
type TagName = typeof TagName;

/** Returns props to create a NotificationListItem component. */
export const useNotificationListItem = createHook<
  TagName,
  NotificationListItemOptions
>(function useNotificationListItem(props) {
  return props;
});

/** Renders a list item that contains a Notification. */
export const NotificationListItem = forwardRef(function NotificationListItem(
  props: NotificationListItemProps,
) {
  const htmlProps = useNotificationListItem(props);
  return createElement(TagName, htmlProps);
});

export interface NotificationListItemOptions<
  _T extends ElementType = TagName,
> extends Options {}

export type NotificationListItemProps<T extends ElementType = TagName> = Props<
  T,
  NotificationListItemOptions<T>
>;
