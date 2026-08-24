import type { createNotificationStore } from "@ariakit/components/notification/notification-store";
import { Notification } from "@ariakit/react-components/notification/notification";
import { NotificationDismiss } from "@ariakit/react-components/notification/notification-dismiss";
import { NotificationHeading } from "@ariakit/react-components/notification/notification-heading";
import type { NotificationHeadingProps } from "@ariakit/react-components/notification/notification-heading";
import { NotificationList } from "@ariakit/react-components/notification/notification-list";
import { NotificationListItem } from "@ariakit/react-components/notification/notification-list-item";
import { NotificationMessage } from "@ariakit/react-components/notification/notification-message";
import { NotificationRegion } from "@ariakit/react-components/notification/notification-region";

interface NotificationFixtureProps {
  store: ReturnType<typeof createNotificationStore>;
  headingProps?: NotificationHeadingProps;
}

export function NotificationFixture({
  store,
  headingProps,
}: NotificationFixtureProps) {
  return (
    <NotificationRegion store={store} aria-label="Fixture notifications">
      <NotificationList store={store} limit={1}>
        {(items) =>
          items.map((item) => (
            <NotificationListItem key={item.id}>
              <Notification item={item}>
                <NotificationHeading {...headingProps} />
                <NotificationMessage />
                <NotificationDismiss>
                  Dismiss {item.message}
                </NotificationDismiss>
              </Notification>
            </NotificationListItem>
          ))
        }
      </NotificationList>
    </NotificationRegion>
  );
}
