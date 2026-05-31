import { q, render, waitFor } from "@ariakit/test/react";
import { expect, test } from "vitest";
import { ComboboxItem } from "../combobox-item.tsx";
import { ComboboxList } from "../combobox-list.tsx";
import { ComboboxProvider } from "../combobox-provider.tsx";
import { Combobox } from "../combobox.tsx";

type AddEventListenerArgs = Parameters<HTMLElement["addEventListener"]>;
type RemoveEventListenerArgs = Parameters<HTMLElement["removeEventListener"]>;

interface TestComboboxProps {
  value: string;
}

function TestCombobox({ value }: TestComboboxProps) {
  return (
    <ComboboxProvider value={value}>
      <Combobox autoSelect autoComplete="both" />
      <ComboboxList>
        <ComboboxItem value="Apple" />
        <ComboboxItem value="Apricot" />
      </ComboboxList>
    </ComboboxProvider>
  );
}

test("does not tear down the focusout listener on inline value updates", async () => {
  let combobox: HTMLElement | null = null;
  let unmount = () => {};
  const container = document.createElement("div");
  // oxlint-disable-next-line typescript/unbound-method
  const originalAddEventListener = HTMLElement.prototype.addEventListener;
  // oxlint-disable-next-line typescript/unbound-method
  const originalRemoveEventListener = HTMLElement.prototype.removeEventListener;
  const focusoutListeners = new Set<EventListenerOrEventListenerObject>();
  const removedFocusoutListeners: EventListenerOrEventListenerObject[] = [];
  document.body.appendChild(container);

  HTMLElement.prototype.addEventListener = function (
    this: HTMLElement,
    ...args: AddEventListenerArgs
  ) {
    const [event, listener, options] = args;
    const capture = typeof options === "boolean" ? options : !!options?.capture;
    if (
      event === "focusout" &&
      this.getAttribute("role") === "combobox" &&
      !capture
    ) {
      focusoutListeners.add(listener);
    }
    return originalAddEventListener.apply(this, args);
  };

  HTMLElement.prototype.removeEventListener = function (
    this: HTMLElement,
    ...args: RemoveEventListenerArgs
  ) {
    const [event, listener] = args;
    if (
      event === "focusout" &&
      this === combobox &&
      focusoutListeners.has(listener)
    ) {
      removedFocusoutListeners.push(listener);
    }
    return originalRemoveEventListener.apply(this, args);
  };

  try {
    const rendered = await render(<TestCombobox value="" />, { container });
    unmount = rendered.unmount;

    const local = q.within(container);
    combobox = local.combobox();
    if (!combobox) {
      throw new Error();
    }
    await waitFor(() => {
      expect(focusoutListeners.size).toBeGreaterThan(0);
    });

    removedFocusoutListeners.length = 0;

    await rendered.rerender(<TestCombobox value="a" />);
    await waitFor(() => {
      const currentCombobox = local.combobox();
      if (!(currentCombobox instanceof HTMLInputElement)) {
        throw new Error();
      }
      expect(currentCombobox.value).toBe("a");
    });
    expect(removedFocusoutListeners).toHaveLength(0);
  } finally {
    unmount();
    container.remove();
    HTMLElement.prototype.addEventListener = originalAddEventListener;
    HTMLElement.prototype.removeEventListener = originalRemoveEventListener;
  }
});
