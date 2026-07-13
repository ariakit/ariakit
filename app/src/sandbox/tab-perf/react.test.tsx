import * as Ariakit from "@ariakit/react";
import { useTab } from "@ariakit/react-components/tab/tab";
import { TabProvider } from "@ariakit/react-components/tab/tab-provider";
import { q } from "@ariakit/test";
import { render } from "@ariakit/test/react";
import { act, createElement, forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, test, vi } from "vitest";

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

interface TypeFixtureProps {
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

function CapabilityFixture({
  disabledTag = "div",
  enabledTag = "button",
  focusable = true,
}: CapabilityFixtureProps) {
  return createElement(
    "div",
    null,
    createElement(
      Ariakit.Focusable,
      {
        focusable,
        render: createElement("div"),
      },
      "Focusable div",
    ),
    createElement(
      Ariakit.Focusable,
      {
        disabled: true,
        render: createElement("a", { href: "#anchor" }),
      },
      "Disabled anchor",
    ),
    createElement(
      Ariakit.Focusable,
      {
        disabled: true,
        render: createElement("button"),
      },
      "Disabled button",
    ),
    createElement(
      Ariakit.Focusable,
      { render: createElement(enabledTag) },
      "Dynamic enabled",
    ),
    createElement(
      Ariakit.Focusable,
      { disabled: true, render: createElement(disabledTag) },
      "Dynamic disabled",
    ),
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

function TypeFixture({
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

test("default button components declare their native type", async () => {
  const observedButtonTypes: Array<string | null> = [];
  const observedCommandTypes: Array<string | null> = [];
  const observedTabTypes: Array<string | null> = [];
  const observedToolbarItemTypes: Array<string | null> = [];
  const observeType = (types: Array<string | null>) =>
    function observeType(element: HTMLButtonElement | null) {
      if (!element) return;
      types.push(element.getAttribute("type"));
    };
  const { unmount } = await render(
    createElement(TypeFixture, {
      buttonRef: observeType(observedButtonTypes),
      commandRef: observeType(observedCommandTypes),
      tabRef: observeType(observedTabTypes),
      toolbarItemRef: observeType(observedToolbarItemTypes),
    }),
  );

  expect(q.tab("Default tab")).toHaveAttribute("type", "button");
  expect(observedTabTypes).toEqual(["button"]);
  expect(q.tab("Submit tab")).toHaveAttribute("type", "submit");
  expect(q.tab("Reset tab")).toHaveAttribute("type", "reset");
  expect(q.tab("Button tab")).toHaveAttribute("type", "button");
  expect(q.tab("Div tab")).not.toHaveAttribute("type");
  expect(q.tab("Hook tab")).not.toHaveAttribute("type");
  expect(q.button("Input command")).toHaveAttribute("type", "submit");
  expect(q.button("Default command")).toHaveAttribute("type", "button");
  expect(observedCommandTypes).toEqual(["button"]);
  expect(q.button("Default button")).toHaveAttribute("type", "button");
  expect(observedButtonTypes).toEqual(["button"]);
  expect(q.button("Submit button")).toHaveAttribute("type", "submit");
  expect(q.button("Reset button")).toHaveAttribute("type", "reset");
  expect(q.text("Div button")).not.toHaveAttribute("type");
  expect(q.button("Toolbar item")).toHaveAttribute("type", "button");
  expect(observedToolbarItemTypes).toEqual(["button"]);

  unmount();
});

test("preserves focusable capabilities for custom elements", async () => {
  const { rerender, unmount } = await render(
    createElement(CapabilityFixture, {}),
  );
  const div = q.text("Focusable div");
  const anchor = q.link("Disabled anchor");
  const button = q.button("Disabled button");

  expect(div).toHaveAttribute("tabindex", "0");
  expect(anchor).toHaveAttribute("tabindex", "-1");
  expect(anchor).not.toHaveAttribute("disabled");
  expect(button).toHaveAttribute("disabled");

  await rerender(
    createElement(CapabilityFixture, {
      disabledTag: "button",
      enabledTag: "div",
    }),
  );
  expect(q.text("Dynamic enabled")).toHaveAttribute("tabindex", "0");
  expect(q.button("Dynamic disabled")).toHaveAttribute("disabled");

  await rerender(createElement(CapabilityFixture, { focusable: false }));
  expect(div).not.toHaveAttribute("tabindex");

  await rerender(createElement(CapabilityFixture, { focusable: true }));
  expect(div).toHaveAttribute("tabindex", "0");

  unmount();
});

test("does not pass the default type to internal custom renders", async () => {
  const { unmount } = await render(createElement(NestedMenuFixture));
  const nestedMenuButton = document.querySelector("#nested-menu-button");

  expect(nestedMenuButton).toHaveProperty("tagName", "DIV");
  expect(nestedMenuButton).not.toHaveAttribute("type");

  unmount();
});

test("server markup and hydration use the same native button type", async () => {
  const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previousActEnvironment = scope.IS_REACT_ACT_ENVIRONMENT;
  scope.IS_REACT_ACT_ENVIRONMENT = true;
  const element = createElement(TypeFixture, {});
  const container = document.createElement("div");
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    container.innerHTML = renderToString(element);
    const unexpectedServerErrors = consoleError.mock.calls.filter(
      ([message]) =>
        !String(message).includes("useLayoutEffect does nothing on the server"),
    );
    expect(unexpectedServerErrors).toEqual([]);
    consoleError.mockClear();
    document.body.appendChild(container);

    expect(container.querySelector("#default-tab")).toHaveAttribute(
      "type",
      "button",
    );
    expect(container.querySelector("#submit-tab")).toHaveAttribute(
      "type",
      "submit",
    );
    expect(container.querySelector("#div-tab")).not.toHaveAttribute("type");
    expect(
      container.querySelector('input[value="Input command"]'),
    ).toHaveAttribute("type", "submit");
    expect(container.querySelector("#default-command")).toHaveAttribute(
      "type",
      "button",
    );
    expect(container.querySelector("#default-button")).toHaveAttribute(
      "type",
      "button",
    );
    expect(container.querySelector("#submit-button")).toHaveAttribute(
      "type",
      "submit",
    );
    expect(container.querySelector("#reset-button")).toHaveAttribute(
      "type",
      "reset",
    );
    expect(container.querySelector("#div-button")).not.toHaveAttribute("type");
    expect(container.querySelector("#toolbar-item")).toHaveAttribute(
      "type",
      "button",
    );

    await act(async () => {
      root = hydrateRoot(container, element);
    });
    expect(consoleError).not.toHaveBeenCalled();

    expect(container.querySelector("#default-tab")).toHaveAttribute(
      "type",
      "button",
    );
    expect(container.querySelector("#submit-tab")).toHaveAttribute(
      "type",
      "submit",
    );
    expect(container.querySelector("#div-tab")).not.toHaveAttribute("type");
    expect(
      container.querySelector('input[value="Input command"]'),
    ).toHaveAttribute("type", "submit");
    expect(container.querySelector("#default-command")).toHaveAttribute(
      "type",
      "button",
    );
    expect(container.querySelector("#default-button")).toHaveAttribute(
      "type",
      "button",
    );
    expect(container.querySelector("#submit-button")).toHaveAttribute(
      "type",
      "submit",
    );
    expect(container.querySelector("#reset-button")).toHaveAttribute(
      "type",
      "reset",
    );
    expect(container.querySelector("#div-button")).not.toHaveAttribute("type");
    expect(container.querySelector("#toolbar-item")).toHaveAttribute(
      "type",
      "button",
    );
  } finally {
    consoleError.mockRestore();
    if (root) {
      await act(async () => root?.unmount());
    }
    container.remove();
    scope.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  }
});
