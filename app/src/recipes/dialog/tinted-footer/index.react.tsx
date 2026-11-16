import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogDisclosure,
  DialogDismiss,
  DialogHeader,
  DialogHeaderContent,
  DialogHeading,
  DialogProvider,
} from "@ariakit/ui/components/dialog.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Input,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import { useId, useState } from "react";

export default function Example() {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <DialogProvider open={open} setOpen={setOpen}>
      <DialogDisclosure $kind="bevel">Invite people</DialogDisclosure>
      <Dialog className="flex flex-col gap-4">
        <DialogHeader>
          <DialogHeaderContent>
            <DialogHeading>Invite to Acme</DialogHeading>
            <DialogDescription>
              People you invite can see every project in this workspace.
            </DialogDescription>
          </DialogHeaderContent>
          <DialogClose />
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <InputField>
            <InputLabel htmlFor={id}>Email address</InputLabel>
            <Input
              id={id}
              name="email"
              type="email"
              placeholder="name@example.com"
              autoFocus
            />
          </InputField>
          {/* A cover frame takes the padding of the dialog and reaches its
              side and bottom edges, with the same bottom corners. The divide
              draws only the top edge, which faces the field, with the width
              and color of the dialog edge. */}
          <Frame
            $cover
            $darken={0.5}
            $divide="inherit"
            className="flex justify-between gap-2"
          >
            <DialogDismiss $kind="bevel">Cancel</DialogDismiss>
            <Button type="submit" $layer="brand" $kind="bevel">
              Send invite
            </Button>
          </Frame>
        </form>
      </Dialog>
    </DialogProvider>
  );
}
