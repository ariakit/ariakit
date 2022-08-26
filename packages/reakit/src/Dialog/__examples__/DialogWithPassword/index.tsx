import React from "react";
import { useDialogState, Dialog } from "reakit";

export function Form() {
  return (
    <form>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" autoComplete="username" />
      <label htmlFor="password">Password</label>
      <input id="password" type="password" autoComplete="new-password" />
    </form>
  );
}

export default function App() {
  const dialog = useDialogState({ visible: true });
  return (
    <div>
      <Dialog
        state={dialog}
        aria-label="Welcome"
        hideOnClickOutside={false}
        onBlur={() => {
          throw new Error("Intentionally throwing");
        }}
      >
        <Form />
      </Dialog>
    </div>
  );
}
