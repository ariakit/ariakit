import { render } from "@ariakit/test/react";
import { afterEach, expect, test, vi } from "vitest";
import { ComboboxItem } from "../combobox/combobox-item-offscreen.tsx";
import { useComboboxStore } from "../combobox/combobox-store.ts";
import { SelectItem } from "./select-item-offscreen.tsx";
import { useSelectStore } from "./select-store.ts";

class TestIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null;
  readonly rootMargin = "0px";
  readonly scrollMargin = "0px";
  readonly thresholds = [];

  constructor(
    _callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.root = options?.root ?? null;
  }

  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
}

interface OffscreenRenderProps {
  "data-offscreen"?: unknown;
  "aria-disabled"?: unknown;
  ref?: unknown;
  disabled?: unknown;
  shouldRegisterItem?: unknown;
  rowId?: unknown;
  preventScrollOnKeyDown?: unknown;
  moveOnKeyPress?: unknown;
  tabbable?: unknown;
  clickOnEnter?: unknown;
  clickOnSpace?: unknown;
  focusable?: unknown;
  accessibleWhenDisabled?: unknown;
  onFocusVisible?: unknown;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function getRenderProps(props: OffscreenRenderProps[]) {
  const lastProps = props.at(-1);
  if (!lastProps) throw new Error("Render props not found");
  return lastProps;
}

test("offscreen SelectItem and ComboboxItem omit composite-only props", async () => {
  vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);
  const selectRenderProps: OffscreenRenderProps[] = [];
  const comboboxRenderProps: OffscreenRenderProps[] = [];

  const Test = () => {
    const select = useSelectStore();
    const combobox = useComboboxStore();

    return (
      <>
        <SelectItem
          data-testid="select"
          store={select}
          value="Apple"
          disabled
          shouldRegisterItem={false}
          rowId="row"
          preventScrollOnKeyDown={false}
          moveOnKeyPress={false}
          tabbable
          clickOnEnter={false}
          clickOnSpace={false}
          focusable={false}
          accessibleWhenDisabled
          onFocusVisible={() => {}}
          offscreenMode="passive"
          offscreenRoot={document.body}
          render={(htmlProps) => {
            selectRenderProps.push(htmlProps);
            return <div />;
          }}
        />
        <ComboboxItem
          data-testid="combobox"
          store={combobox}
          value="Apple"
          disabled
          shouldRegisterItem={false}
          rowId="row"
          preventScrollOnKeyDown={false}
          moveOnKeyPress={false}
          tabbable
          clickOnEnter={false}
          clickOnSpace={false}
          focusable={false}
          accessibleWhenDisabled
          onFocusVisible={() => {}}
          offscreenMode="passive"
          offscreenRoot={document.body}
          render={(htmlProps) => {
            comboboxRenderProps.push(htmlProps);
            return <div />;
          }}
        />
      </>
    );
  };

  await render(<Test />);

  const selectItemProps = getRenderProps(selectRenderProps);
  const comboboxItemProps = getRenderProps(comboboxRenderProps);

  expect(selectItemProps["data-offscreen"]).toBe(true);
  expect(selectItemProps["aria-disabled"]).toBe(true);
  expect("disabled" in selectItemProps).toBe(false);
  expect("shouldRegisterItem" in selectItemProps).toBe(false);
  expect("rowId" in selectItemProps).toBe(false);
  expect("preventScrollOnKeyDown" in selectItemProps).toBe(false);
  expect("moveOnKeyPress" in selectItemProps).toBe(false);
  expect("tabbable" in selectItemProps).toBe(false);
  expect("clickOnEnter" in selectItemProps).toBe(false);
  expect("clickOnSpace" in selectItemProps).toBe(false);
  expect("focusable" in selectItemProps).toBe(false);
  expect("accessibleWhenDisabled" in selectItemProps).toBe(false);
  expect("onFocusVisible" in selectItemProps).toBe(false);

  expect(comboboxItemProps["data-offscreen"]).toBe(true);
  expect(comboboxItemProps["aria-disabled"]).toBe(true);
  expect("disabled" in comboboxItemProps).toBe(false);
  expect("shouldRegisterItem" in comboboxItemProps).toBe(false);
  expect("rowId" in comboboxItemProps).toBe(false);
  expect("preventScrollOnKeyDown" in comboboxItemProps).toBe(false);
  expect("moveOnKeyPress" in comboboxItemProps).toBe(false);
  expect("tabbable" in comboboxItemProps).toBe(false);
  expect("clickOnEnter" in comboboxItemProps).toBe(false);
  expect("clickOnSpace" in comboboxItemProps).toBe(false);
  expect("focusable" in comboboxItemProps).toBe(false);
  expect("accessibleWhenDisabled" in comboboxItemProps).toBe(false);
  expect("onFocusVisible" in comboboxItemProps).toBe(false);
});
