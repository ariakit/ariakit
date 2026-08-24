import { createNotificationStore } from "@ariakit/components/notification/notification-store";
import type {
  NotificationStore,
  NotificationStoreItem,
} from "@ariakit/components/notification/notification-store";
import { expectTypeOf, test } from "vitest";
import { NotificationItems } from "./notification-items.tsx";
import type { NotificationItemsProps } from "./notification-items.tsx";
import { NotificationListItem } from "./notification-list-item.tsx";
import { NotificationList } from "./notification-list.tsx";
import { Notification } from "./notification.tsx";

interface NotificationData {
  href?: string;
  onUndo?: () => void;
}

test("preserves the notification record and component type contracts", () => {
  const checkTypes = () => {
    const plain = createNotificationStore();
    plain.push("Saved.");
    plain.push({ message: "Saved." });

    const notifications = createNotificationStore<NotificationData>();
    notifications.push("Message sent.");
    notifications.push({
      message: "Deleted.",
      data: { onUndo: () => {} },
    });

    const strict = createNotificationStore<{ userId: string }>();
    strict.push({ message: "Saved.", data: { userId: "1" } });
    // @ts-expect-error TS2345: The string arm is withdrawn when data is required.
    strict.push("Saved.");
    // @ts-expect-error TS2345: Data is required for this record type.
    strict.push({ message: "Saved." });

    // @ts-expect-error TS2561: Did you mean `message`?
    plain.push({ mesage: "Saved." });

    notifications.update("n1", {});
    notifications.update("n1", {
      message: "Restored.",
      heading: undefined,
      announceMessage: undefined,
      timeout: undefined,
      priority: undefined,
      data: undefined,
    });
    strict.update("n1", { data: { userId: "2" } });
    plain.update("n1", { data: undefined });
    // @ts-expect-error TS2345: Message cannot be cleared with `undefined`.
    notifications.update("n1", { message: undefined });
    // @ts-expect-error TS2345: Optional fields cannot hide an invalid message.
    notifications.update("n1", { heading: undefined, message: undefined });
    // @ts-expect-error TS2345: Data is required for this record type.
    strict.update("n1", { data: undefined });
    // @ts-expect-error TS2345: Optional fields cannot hide invalid data.
    strict.update("n1", { heading: undefined, data: undefined });
    // @ts-expect-error TS2561: Did you mean `message`?
    notifications.update("n1", { mesage: "Restored." });
    // @ts-expect-error TS2353: A valid field cannot hide an immutable id.
    notifications.update("n1", { message: "Restored.", id: "n2" });

    createNotificationStore<NotificationData>({ defaultItems: [] });

    const seed: NotificationStoreItem<NotificationData>[] = [
      { id: "n1", message: "Restored.", createdAt: Date.now() },
    ];
    const badSeed: NotificationStoreItem<{ userId: string }>[] = [
      // @ts-expect-error TS2322: Data is required unless `{}` extends `T`.
      { id: "n1", message: "Restored.", createdAt: Date.now() },
    ];

    // @ts-expect-error TS2353: Updating an id would re-key the record.
    notifications.update("n1", { id: "n2" });
    // @ts-expect-error TS2353: Array position, not createdAt, defines ordering.
    notifications.update("n1", { createdAt: 0 });

    const a = (
      <NotificationList limit={3}>
        {(items) =>
          items.map((item) => (
            <NotificationListItem key={item.id}>
              <Notification item={item} />
            </NotificationListItem>
          ))
        }
      </NotificationList>
    );

    const b = (
      <NotificationList limit={3}>
        {(items) =>
          items.map((item) => (
            // @ts-expect-error TS18046: Data is unknown without a store prop.
            <button key={item.id} onClick={item.data.onUndo} />
          ))
        }
      </NotificationList>
    );

    const c = (
      // @ts-expect-error TS2344 on 6.0.2 and TS2740 on 7.0.2: NotificationData is not a store.
      <NotificationList<NotificationData> limit={3}>
        {() => null}
      </NotificationList>
    );

    type Wrong = NotificationStore<{ userId: string }>;

    const d = (
      // @ts-expect-error TS2322: The annotation and store prop disagree.
      <NotificationList<Wrong> store={notifications}>
        {() => null}
      </NotificationList>
    );

    const e = (
      // @ts-expect-error TS2322: Did you mean `limit`?
      <NotificationList store={notifications} limt={3}>
        {() => null}
      </NotificationList>
    );

    const f = (
      <NotificationList store={notifications} limit={3}>
        {(items) =>
          items.map((item) => (
            <button key={item.id} onClick={item.data?.onUndo} />
          ))
        }
      </NotificationList>
    );

    const g = (
      <NotificationItems store={notifications}>
        {(items) => (
          <span>{items.filter((item) => item.data?.onUndo).length}</span>
        )}
      </NotificationItems>
    );

    const h = (
      <NotificationList<NotificationStore<NotificationData>> limit={3}>
        {(items) =>
          items.map((item) => (
            <button key={item.id} onClick={item.data?.onUndo} />
          ))
        }
      </NotificationList>
    );

    function MyItems(
      props: NotificationItemsProps<NotificationStore<NotificationData>>,
    ) {
      return <NotificationItems {...props} />;
    }

    const defaultItemsStore = createNotificationStore({ defaultItems: [] });
    const itemsStore = createNotificationStore({ items: [] });
    expectTypeOf(defaultItemsStore).toEqualTypeOf<NotificationStore<unknown>>();
    expectTypeOf(itemsStore).toEqualTypeOf<NotificationStore<unknown>>();

    const controlledItems: NotificationStoreItem<NotificationData>[] = seed;
    const controlledStore = createNotificationStore<NotificationData>({
      defaultItems: controlledItems,
      items: controlledItems,
      setItems: (_items: NotificationStoreItem<NotificationData>[]) => {},
    });

    return [a, b, c, d, e, f, g, h, badSeed, controlledStore, MyItems] as const;
  };

  expectTypeOf(checkTypes).toBeFunction();
});
