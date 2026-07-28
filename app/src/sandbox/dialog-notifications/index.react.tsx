import { Button, Dialog, DialogDismiss, DialogHeading } from "@ariakit/react";
import { useState } from "react";

interface Notification {
  id: number;
}

export default function Example() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = () => {
    setNotifications((current) => {
      const lastNotification = current.at(-1);
      const id = lastNotification ? lastNotification.id + 1 : 1;
      return [...current, { id }];
    });
  };

  const closeNotification = (id: number) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );
  };

  return (
    <>
      <Button className="button" onClick={showNotification}>
        Say Hello
      </Button>
      <Button className="button" onClick={() => setOpen(true)}>
        Show modal
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        getPersistentElements={() =>
          document.querySelectorAll("[data-notifications]")
        }
        backdrop={<div className="fixed inset-0 bg-black/20" />}
        className="fixed inset-x-4 top-20 mx-auto max-w-md rounded bg-white p-4"
      >
        <DialogHeading>Notification</DialogHeading>
        <p>Click on the button below to show a notification.</p>
        <Button onClick={showNotification}>Say Hello</Button>
        <DialogDismiss>Cancel</DialogDismiss>
      </Dialog>
      <div
        data-notifications
        className="fixed right-4 top-4 z-50 flex flex-col gap-2"
      >
        {notifications.map((notification) => (
          <div key={notification.id} role="alert">
            Hello!
            <button
              aria-label="close"
              onClick={() => closeNotification(notification.id)}
            >
              Close
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
