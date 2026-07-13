import * as Ariakit from "@ariakit/react";
import { useTab } from "@ariakit/react-components/tab/tab";
import { TabProvider } from "@ariakit/react-components/tab/tab-provider";
import { createElement, forwardRef, useCallback, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";

const CustomButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(function CustomButton(props, ref) {
  return createElement("button", { ...props, ref });
});

function HookTab() {
  const props = useTab<"div">({ id: "hook-tab" });
  return createElement(Ariakit.Role, props, "Hook tab");
}

export interface TypeFixtureProps {
  buttonRef?: (element: HTMLButtonElement | null) => void;
  commandRef?: (element: HTMLButtonElement | null) => void;
  tabRef?: (element: HTMLButtonElement | null) => void;
  toolbarItemRef?: (element: HTMLButtonElement | null) => void;
}

interface CapabilityFixtureProps {
  disabledTag?: "button" | "div";
  enabledTag?: "button" | "div";
  focusable?: boolean;
}

interface DynamicCommandFixtureProps {
  firstTag?: "button" | "div";
  secondTag?: "button" | "div";
}

function CapabilityFixture({
  disabledTag = "div",
  enabledTag = "button",
  focusable = true,
}: CapabilityFixtureProps) {
  return (
    <div>
      <Ariakit.Focusable focusable={focusable} render={<div />}>
        Focusable div
      </Ariakit.Focusable>
      <Ariakit.Focusable disabled render={<a href="#disabled-anchor" />}>
        Disabled anchor
      </Ariakit.Focusable>
      <Ariakit.Focusable disabled render={<button />}>
        Disabled button
      </Ariakit.Focusable>
      <Ariakit.Focusable render={createElement(enabledTag)}>
        Dynamic enabled
      </Ariakit.Focusable>
      <Ariakit.Focusable disabled render={createElement(disabledTag)}>
        Dynamic disabled
      </Ariakit.Focusable>
    </div>
  );
}

function DynamicCommandFixture({
  firstTag = "button",
  secondTag = "div",
}: DynamicCommandFixtureProps) {
  return (
    <>
      <Ariakit.Command render={createElement(firstTag)}>
        Dynamic from button
      </Ariakit.Command>
      <Ariakit.Command render={createElement(secondTag)}>
        Dynamic from div
      </Ariakit.Command>
    </>
  );
}

function NestedMenuFixture() {
  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton>Root menu</Ariakit.MenuButton>
      <Ariakit.Menu alwaysVisible>
        <Ariakit.MenuProvider>
          <Ariakit.MenuButton id="nested-menu-button">
            Nested menu
          </Ariakit.MenuButton>
        </Ariakit.MenuProvider>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

export function TypeFixture({
  buttonRef,
  commandRef,
  tabRef,
  toolbarItemRef,
}: TypeFixtureProps) {
  return (
    <TabProvider defaultSelectedId="default-tab">
      <Ariakit.TabList aria-label="Types">
        <Ariakit.Tab id="default-tab" ref={tabRef}>
          Default tab
        </Ariakit.Tab>
        <Ariakit.Tab id="submit-tab" render={<button type="submit" />}>
          Submit tab
        </Ariakit.Tab>
        <Ariakit.Tab id="reset-tab" render={<CustomButton type="reset" />}>
          Reset tab
        </Ariakit.Tab>
        <Ariakit.Tab id="div-tab" render={<div />}>
          Div tab
        </Ariakit.Tab>
        <Ariakit.Tab id="button-tab" render={<button />}>
          Button tab
        </Ariakit.Tab>
        <HookTab />
      </Ariakit.TabList>
      <Ariakit.Command
        aria-label="Input command"
        render={<input type="submit" value="Input command" />}
      />
      <Ariakit.Command id="default-command" ref={commandRef}>
        Default command
      </Ariakit.Command>
      <Ariakit.Button id="default-button" ref={buttonRef}>
        Default button
      </Ariakit.Button>
      <Ariakit.Button id="submit-button" type="submit">
        Submit button
      </Ariakit.Button>
      <Ariakit.Button id="reset-button" render={<CustomButton type="reset" />}>
        Reset button
      </Ariakit.Button>
      <Ariakit.Button id="div-button" render={<div />}>
        Div button
      </Ariakit.Button>
      <Ariakit.Toolbar>
        <Ariakit.ToolbarItem id="toolbar-item" ref={toolbarItemRef}>
          Toolbar item
        </Ariakit.ToolbarItem>
      </Ariakit.Toolbar>
    </TabProvider>
  );
}

function useObservedType() {
  const [type, setType] = useState<string | null>();
  const ref = useCallback((element: HTMLButtonElement | null) => {
    if (!element) return;
    setType(element.getAttribute("type"));
  }, []);
  return [type, ref] as const;
}

export default function Example() {
  const [swapped, setSwapped] = useState(false);
  const [focusable, setFocusable] = useState(true);
  const [buttonType, buttonRef] = useObservedType();
  const [commandType, commandRef] = useObservedType();
  const [tabType, tabRef] = useObservedType();
  const [toolbarItemType, toolbarItemRef] = useObservedType();
  return (
    <div>
      <TypeFixture
        buttonRef={buttonRef}
        commandRef={commandRef}
        tabRef={tabRef}
        toolbarItemRef={toolbarItemRef}
      />
      <output aria-label="Default button ref type">{buttonType}</output>
      <output aria-label="Default command ref type">{commandType}</output>
      <output aria-label="Default tab ref type">{tabType}</output>
      <output aria-label="Toolbar item ref type">{toolbarItemType}</output>
      <button type="button" onClick={() => setSwapped((value) => !value)}>
        Swap rendered elements
      </button>
      <button type="button" onClick={() => setFocusable((value) => !value)}>
        Toggle focusable
      </button>
      <CapabilityFixture
        disabledTag={swapped ? "button" : "div"}
        enabledTag={swapped ? "div" : "button"}
        focusable={focusable}
      />
      <DynamicCommandFixture
        firstTag={swapped ? "div" : "button"}
        secondTag={swapped ? "button" : "div"}
      />
      <NestedMenuFixture />
    </div>
  );
}
