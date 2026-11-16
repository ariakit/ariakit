import { Badge, BadgeSlot } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Dialog,
  DialogDescription,
  DialogDisclosure,
  DialogDismiss,
  DialogHeader,
  DialogHeaderContent,
  DialogHeading,
  DialogProvider,
} from "@ariakit/ui/components/dialog.ariakit.react";
import { TrashIcon } from "lucide-react";
import { useRef, useState } from "react";

export default function Example() {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [deleted, setDeleted] = useState(false);
  return (
    <div className="flex flex-col items-start gap-3">
      <DialogProvider>
        {/* The button stays focusable when it's disabled, so focus can go
            back to it when the dialog closes. */}
        <DialogDisclosure
          $kind="bevel"
          disabled={deleted}
          accessibleWhenDisabled
        >
          Delete project
        </DialogDisclosure>
        {/* An alert dialog needs an answer, so a click outside doesn't close
            it, and focus starts on the choice that changes nothing. */}
        <Dialog
          role="alertdialog"
          initialFocus={cancelRef}
          hideOnInteractOutside={false}
          $maxWidth={88}
          className="flex flex-col items-center gap-4 text-center"
        >
          {/* The slot is one line of the badge text tall, and it moves into
              the side padding, so the badge stays round. The padding sets the
              size of the badge. */}
          <Badge $layer="danger" $border={false} $p={3}>
            <BadgeSlot $size="xl">
              <TrashIcon />
            </BadgeSlot>
          </Badge>
          {/* The header spaces the title and the description. Its content
              fills the row, so the centered text stays centered. */}
          <DialogHeader>
            <DialogHeaderContent>
              <DialogHeading>Delete “Website redesign”?</DialogHeading>
              <DialogDescription>
                The project and its 48 tasks go away for all members. You can't
                undo this.
              </DialogDescription>
            </DialogHeaderContent>
          </DialogHeader>
          <div className="grid w-full grid-cols-2 gap-2">
            <DialogDismiss ref={cancelRef} $kind="bevel">
              Cancel
            </DialogDismiss>
            <DialogDismiss
              $layer="danger"
              $kind="bevel"
              onClick={() => setDeleted(true)}
            >
              Delete
            </DialogDismiss>
          </div>
        </Dialog>
      </DialogProvider>
      <p role="status">{deleted && "Website redesign was deleted"}</p>
    </div>
  );
}
