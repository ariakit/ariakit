import * as ak from "@ariakit/react";
import { useCallback, useEffect, useState } from "react";

// Auto-saving a draft when the user switches away from the tab is a common
// pattern. The save runs through the form store's `submit()`, which internally
// awaits a `requestAnimationFrame`. Browsers pause animation frames in hidden
// documents, so the submission must not depend on a frame that may never come.
// See https://github.com/ariakit/ariakit/issues/6309
export default function Example() {
  const form = ak.useFormStore({ defaultValues: { draft: "" } });
  const [saveState, setSaveState] = useState("Idle");

  form.useSubmit(async () => {
    // Simulate a quick network request that saves the draft. Timers keep
    // running while the tab is hidden, so this resolves regardless of
    // visibility.
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  // The visible state follows the `submit()` promise so it reflects when the
  // submission actually settles — the exact thing that stalls while hidden.
  const save = useCallback(() => {
    setSaveState("Saving");
    form.submit().then(
      (success) => setSaveState(success ? "Saved" : "Idle"),
      () => setSaveState("Idle"),
    );
  }, [form]);

  // Auto-save the draft when the user switches away from the tab.
  useEffect(() => {
    function onVisibilityChange() {
      if (document.hidden) save();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [save]);

  return (
    <ak.Form store={form} aria-label="Draft">
      <ak.FormLabel name={form.names.draft}>Draft</ak.FormLabel>
      <ak.FormInput name={form.names.draft} />
      <button type="button" onClick={save}>
        Save
      </button>
      <p>
        Save state: <output>{saveState}</output>
      </p>
    </ak.Form>
  );
}
