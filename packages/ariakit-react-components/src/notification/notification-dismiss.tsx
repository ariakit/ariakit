import {
  useEvent,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { invariant } from "@ariakit/utils";
import type { ElementType, MouseEvent } from "react";
import { useContext } from "react";
import type { ButtonOptions } from "../button/button.tsx";
import { useButton } from "../button/button.tsx";
import { withDefaultButtonType } from "../button/utils.ts";
import { NotificationItemContext } from "./__notification-context.tsx";
import { useNotificationScopedContext } from "./notification-context.tsx";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/** Returns props to create a NotificationDismiss component. */
export const useNotificationDismiss = createHook<
  TagName,
  NotificationDismissOptions
>(function useNotificationDismiss(props) {
  const store = useNotificationScopedContext();
  const item = useContext(NotificationItemContext);

  invariant(
    store && item,
    process.env.NODE_ENV !== "production" &&
      "NotificationDismiss must be wrapped in a Notification component.",
  );

  const onClickProp = props.onClick;
  const onClick = useEvent((event: MouseEvent<HTMLType>) => {
    onClickProp?.(event);
    if (event.defaultPrevented) return;
    store.remove(item.id);
  });

  props = {
    "data-notification-dismiss": "",
    ...props,
    onClick,
  };

  return useButton(props);
});

/** Renders a button that removes its enclosing notification. */
export const NotificationDismiss = forwardRef(function NotificationDismiss(
  props: NotificationDismissProps,
) {
  const htmlProps = useNotificationDismiss(withDefaultButtonType(props));
  return createElement(TagName, htmlProps);
});

export interface NotificationDismissOptions<
  T extends ElementType = TagName,
> extends ButtonOptions<T> {}

export type NotificationDismissProps<T extends ElementType = TagName> = Props<
  T,
  NotificationDismissOptions<T>
>;
