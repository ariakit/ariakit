---
"@ariakit/components": patch
"@ariakit/react-components": patch
---

Experimental Notification API

The experimental Notification API provides a framework-neutral store and composable React components for visual cards and separate live-region announcements. Records can expire or remain until removed, and rendered notifications support focus restoration, Escape handling, and swipe dismissal.

```tsx
import { createNotificationStore } from "@ariakit/components/notification/notification-store";
import { Notification } from "@ariakit/react-components/notification/notification";
import { NotificationDismiss } from "@ariakit/react-components/notification/notification-dismiss";
import { NotificationHeading } from "@ariakit/react-components/notification/notification-heading";
import { NotificationList } from "@ariakit/react-components/notification/notification-list";
import { NotificationListItem } from "@ariakit/react-components/notification/notification-list-item";
import { NotificationMessage } from "@ariakit/react-components/notification/notification-message";
import { NotificationProvider } from "@ariakit/react-components/notification/notification-provider";
import { NotificationRegion } from "@ariakit/react-components/notification/notification-region";

const notifications = createNotificationStore();

export function App() {
  return (
    <NotificationProvider store={notifications}>
      <button
        onClick={() =>
          notifications.push({
            heading: "File saved",
            message: "Changes are synced.",
          })
        }
      >
        Save
      </button>
      <NotificationRegion aria-label="Notifications">
        <NotificationList>
          {(items) =>
            items.map((item) => (
              <NotificationListItem key={item.id}>
                <Notification item={item}>
                  <NotificationHeading />
                  <NotificationMessage />
                  <NotificationDismiss>Dismiss</NotificationDismiss>
                </Notification>
              </NotificationListItem>
            ))
          }
        </NotificationList>
      </NotificationRegion>
    </NotificationProvider>
  );
}
```

Thanks to [@artalar](https://github.com/artalar) for proposing the feature and collecting prior art, [@folz](https://github.com/folz) for analyzing alert and live-region tradeoffs, [@R-Oscar](https://github.com/R-Oscar) for proposing separate polite and assertive live regions, [@gziolo](https://github.com/gziolo) for sharing the WordPress `speak()` announcer approach, [@IanVS](https://github.com/IanVS) for proposing status announcements for Select and Combobox, [@alvarlagerlof](https://github.com/alvarlagerlof) for identifying the server-rendering ownership risk, [@strass](https://github.com/strass) for creating an exploratory implementation, and [@helciofranco](https://github.com/helciofranco) for diagnosing unbounded notification history.
