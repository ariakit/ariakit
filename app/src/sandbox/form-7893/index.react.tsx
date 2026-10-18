import * as Ariakit from "@ariakit/react";
import { useRef, useState } from "react";

const takenUsernames = ["ada"];

interface PendingCheck {
  cancel: () => void;
  finish: () => void;
}

// The username check is cancelled whenever the form validates again, like a
// debounced server call. The visible button stands in for the server response
// so the pending state can be inspected before it settles.
function UsernameForm() {
  const form = Ariakit.useFormStore({ defaultValues: { username: "" } });
  const validating = Ariakit.useStoreState(form, "validating");
  const valid = Ariakit.useStoreState(form, "valid");
  const pendingCheck = useRef<PendingCheck | null>(null);
  const [checking, setChecking] = useState(false);

  Ariakit.useFormValidate(form, async ({ values }) => {
    pendingCheck.current?.cancel();
    setChecking(true);
    const finished = await new Promise<boolean>((resolve) => {
      pendingCheck.current = {
        cancel: () => resolve(false),
        finish: () => resolve(true),
      };
    });
    // A newer check replaced this one.
    if (!finished) return;
    pendingCheck.current = null;
    setChecking(false);
    if (takenUsernames.includes(values.username.toLowerCase())) {
      form.setError(form.names.username, "Username is taken");
    }
  });

  return (
    <Ariakit.Form store={form} aria-label="Add user" className="wrapper">
      <div className="field">
        <Ariakit.FormLabel name={form.names.username}>
          Username
        </Ariakit.FormLabel>
        <Ariakit.FormInput name={form.names.username} className="input" />
        <Ariakit.FormError name={form.names.username} className="error" />
      </div>
      <p>
        {`Username check: ${checking ? "pending" : "idle"} | Validating: ${
          validating ? "yes" : "no"
        }`}
      </p>
      <div className="buttons">
        <button
          type="button"
          className="button secondary"
          onClick={() => pendingCheck.current?.finish()}
        >
          Finish username check
        </button>
        <Ariakit.FormSubmit className="button" disabled={validating || !valid}>
          Add
        </Ariakit.FormSubmit>
      </div>
    </Ariakit.Form>
  );
}

// Pressing Enter saves the draft and moving focus out of the input autosaves
// it, so both saves can be pending at the same time. The visible button stands
// in for the server response to the oldest pending save.
function DraftForm() {
  const form = Ariakit.useFormStore({ defaultValues: { draft: "" } });
  const submitting = Ariakit.useStoreState(form, "submitting");
  const pendingSaves = useRef<Array<() => void>>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  Ariakit.useFormSubmit(form, async () => {
    await new Promise<void>((resolve) => {
      pendingSaves.current.push(resolve);
      setPendingCount(pendingSaves.current.length);
    });
    setCompletedCount((count) => count + 1);
  });

  const finishOldestSave = () => {
    const resolve = pendingSaves.current.shift();
    setPendingCount(pendingSaves.current.length);
    resolve?.();
  };

  return (
    <Ariakit.Form store={form} aria-label="Edit draft" className="wrapper">
      <div className="field">
        <Ariakit.FormLabel name={form.names.draft}>Draft</Ariakit.FormLabel>
        <Ariakit.FormInput
          name={form.names.draft}
          className="input"
          onBlur={() => void form.submit()}
        />
      </div>
      <p>
        {`Pending saves: ${pendingCount} | Submitting: ${
          submitting ? "yes" : "no"
        } | Completed: ${completedCount}`}
      </p>
      <div className="buttons">
        <Ariakit.FormSubmit className="button">Save draft</Ariakit.FormSubmit>
        <button
          type="button"
          className="button secondary"
          onClick={finishOldestSave}
        >
          Finish oldest save
        </button>
      </div>
    </Ariakit.Form>
  );
}

export default function Example() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <UsernameForm />
      <DraftForm />
    </div>
  );
}
