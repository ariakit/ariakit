import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  CheckboxField,
  CheckboxGroup,
  CheckboxList,
} from "@ariakit/ui/components/checkbox.ariakit.react";
import {
  Dialog,
  DialogClose,
  DialogDisclosure,
  DialogHeading,
  DialogProvider,
  DialogScroll,
} from "@ariakit/ui/components/dialog.ariakit.react";
import {
  Shell,
  ShellEnd,
  ShellFooter,
  ShellHeader,
  ShellMain,
  ShellMainBody,
  ShellStart,
} from "@ariakit/ui/components/shell.ariakit.react";
import { useState } from "react";

const filters = ["Status", "Assignee", "Priority", "Labels", "Project"];
const options = ["Any", "Mine", "Unassigned"];

export default function Example() {
  const [open, setOpen] = useState(false);
  // A new key mounts the checkboxes again with their default values.
  const [resetCount, setResetCount] = useState(0);
  return (
    <DialogProvider open={open} setOpen={setOpen}>
      <DialogDisclosure $kind="bevel">Filter tasks</DialogDisclosure>
      {/* The end placement fills the height of the window at its end edge,
          and the dialog slides in from that edge. */}
      <Dialog $placement="end" $p="none" $maxWidth={96}>
        <DialogScroll>
          <Shell>
            {/* The close button takes a negative margin, so the header space
                puts its hover surface as far from the top as from the end.
                The sides keep the padding of main, so the title lines up
                with the filters. */}
            <ShellHeader $p={2} $px={4}>
              <ShellStart>
                <DialogHeading $size="sm">Filters</DialogHeading>
              </ShellStart>
              <ShellEnd>
                <DialogClose />
              </ShellEnd>
            </ShellHeader>
            <ShellMain $size="auto" $p={4}>
              <ShellMainBody key={resetCount} className="gap-y-5">
                {filters.map((name) => (
                  <CheckboxGroup key={name} label={name}>
                    <CheckboxList>
                      {options.map((option) => (
                        <CheckboxField
                          key={option}
                          name={name.toLowerCase()}
                          value={option.toLowerCase()}
                          defaultChecked={option === "Any"}
                        >
                          {option}
                        </CheckboxField>
                      ))}
                    </CheckboxList>
                  </CheckboxGroup>
                ))}
              </ShellMainBody>
            </ShellMain>
            <ShellFooter $sticky $p={2}>
              <ShellStart>
                <Button
                  $lightnessOffset
                  onClick={() => setResetCount((count) => count + 1)}
                >
                  Reset
                </Button>
              </ShellStart>
              <ShellEnd>
                <Button
                  $layer="brand"
                  $kind="bevel"
                  onClick={() => setOpen(false)}
                >
                  Show 24 tasks
                </Button>
              </ShellEnd>
            </ShellFooter>
          </Shell>
        </DialogScroll>
      </Dialog>
    </DialogProvider>
  );
}
