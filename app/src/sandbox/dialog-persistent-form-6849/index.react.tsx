import * as Ariakit from "@ariakit/react";
import { useRef, useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);
  const persistentFormRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)}>Open dialog</Ariakit.Button>

      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        autoFocusOnShow={false}
        getPersistentElements={() => {
          const form = persistentFormRef.current;
          return form ? [form] : [];
        }}
      >
        <Ariakit.DialogHeading>Dialog</Ariakit.DialogHeading>
      </Ariakit.Dialog>

      <form ref={persistentFormRef}>
        <input aria-label="Persistent field" />
      </form>

      <input aria-label="Outside field" />
    </>
  );
}
