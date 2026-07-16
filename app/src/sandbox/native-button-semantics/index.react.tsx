import * as Ariakit from "@ariakit/react";
import { useTab } from "@ariakit/react-components/tab/tab";
import { TabProvider } from "@ariakit/react-components/tab/tab-provider";
import { forwardRef, useCallback, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";

const CustomButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(function CustomButton(props, ref) {
  return <button {...props} ref={ref} />;
});

function HookTab() {
  const props = useTab<"div">();
  return <Ariakit.Role {...props}>Hook tab</Ariakit.Role>;
}

export interface TypeFixtureProps {
  buttonRef?: (element: HTMLButtonElement | null) => void;
  commandRef?: (element: HTMLButtonElement | null) => void;
  tabRef?: (element: HTMLButtonElement | null) => void;
  toolbarItemRef?: (element: HTMLButtonElement | null) => void;
}

interface CapabilityFixtureProps {
  focusable?: boolean;
}

function CapabilityFixture({ focusable = true }: CapabilityFixtureProps) {
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
    </div>
  );
}

function NestedMenuFixture() {
  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton>Root menu</Ariakit.MenuButton>
      <Ariakit.Menu alwaysVisible>
        <Ariakit.MenuProvider>
          <Ariakit.MenuButton>Nested menu</Ariakit.MenuButton>
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
    <>
      <TabProvider>
        <Ariakit.TabList aria-label="Types">
          <Ariakit.Tab ref={tabRef}>Default tab</Ariakit.Tab>
          <Ariakit.Tab render={<button type="submit" />}>
            Submit tab
          </Ariakit.Tab>
          <Ariakit.Tab render={<CustomButton type="reset" />}>
            Reset tab
          </Ariakit.Tab>
          <Ariakit.Tab render={<div />}>Div tab</Ariakit.Tab>
          <Ariakit.Tab render={<button />}>Button tab</Ariakit.Tab>
          <HookTab />
        </Ariakit.TabList>
        <Ariakit.Command
          aria-label="Input command"
          render={<input type="submit" value="Input command" />}
        />
        <Ariakit.Command ref={commandRef}>Default command</Ariakit.Command>
        <Ariakit.Button ref={buttonRef}>Default button</Ariakit.Button>
        <Ariakit.Button type="submit">Submit button</Ariakit.Button>
        <Ariakit.Button render={<CustomButton type="reset" />}>
          Reset button
        </Ariakit.Button>
        <Ariakit.Button render={<div />}>Div button</Ariakit.Button>
        <Ariakit.Toolbar>
          <Ariakit.ToolbarItem ref={toolbarItemRef}>
            Toolbar item
          </Ariakit.ToolbarItem>
        </Ariakit.Toolbar>
      </TabProvider>
      <NestedMenuFixture />
    </>
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

function SubmitFocusFixture() {
  const [focusable, setFocusable] = useState(true);
  return (
    <Ariakit.Button
      focusable={focusable}
      type="submit"
      onKeyDown={(event) => {
        if (event.key !== "f") return;
        setFocusable(false);
      }}
    >
      Submit focus target
    </Ariakit.Button>
  );
}

export default function Example() {
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
      <button type="button" onClick={() => setFocusable((value) => !value)}>
        Toggle focusable
      </button>
      <CapabilityFixture focusable={focusable} />
      <SubmitFocusFixture />
    </div>
  );
}
