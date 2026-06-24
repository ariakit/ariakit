import * as ak from "@ariakit/react";
import { useCallback, useEffect, useState } from "react";

// TODO: Workaround for https://github.com/ariakit/ariakit/issues/6309 — remove
// once the fix is released. The form store awaits `requestAnimationFrame`, which
// browsers pause in hidden documents, stalling submit()/validate() until the tab
// is foregrounded. Patch `requestAnimationFrame` to fall back to a timeout while
// the document is hidden (when the real one wouldn't fire anyway). The store
// never cancels these frames, so returning a timeout id is safe.
if (typeof window !== "undefined") {
  const originalRequestAnimationFrame =
    window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (callback) => {
    if (!document.hidden) {
      return originalRequestAnimationFrame(callback);
    }
    return window.setTimeout(() => callback(performance.now()), 16);
  };
}

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
