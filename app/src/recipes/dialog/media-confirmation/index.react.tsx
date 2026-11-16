import {
  Dialog,
  DialogDescription,
  DialogDisclosure,
  DialogDismiss,
  DialogHeader,
  DialogHeaderContent,
  DialogHeaderSlot,
  DialogHeading,
  DialogProvider,
} from "@ariakit/ui/components/dialog.ariakit.react";
import { ArchiveIcon } from "lucide-react";
import { useState } from "react";

export default function Example() {
  const [archived, setArchived] = useState(false);
  return (
    <div className="flex flex-col items-start gap-3">
      <DialogProvider>
        <DialogDisclosure
          $kind="bevel"
          disabled={archived}
          accessibleWhenDisabled
        >
          Archive projects
        </DialogDisclosure>
        <Dialog
          role="alertdialog"
          hideOnInteractOutside={false}
          $maxWidth={120}
          className="flex flex-col gap-4"
        >
          {/* The tile shows what the action does, and the text sits beside
              it. The tile is two text rows tall, so it spans the title and
              the first line of the description. */}
          <DialogHeader>
            <DialogHeaderSlot $lightnessOffset={2} $size="xl" $rowSpan={2}>
              <ArchiveIcon strokeWidth={1.5} />
            </DialogHeaderSlot>
            <DialogHeaderContent>
              <DialogHeading>Archive 3 projects?</DialogHeading>
              <DialogDescription>
                Archived projects leave the sidebar. You can restore them from
                the archive at any time.
              </DialogDescription>
            </DialogHeaderContent>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <DialogDismiss $kind="bevel">Cancel</DialogDismiss>
            <DialogDismiss
              $layer="brand"
              $kind="bevel"
              onClick={() => setArchived(true)}
            >
              Archive
            </DialogDismiss>
          </div>
        </Dialog>
      </DialogProvider>
      <p role="status">{archived && "3 projects were archived"}</p>
    </div>
  );
}
