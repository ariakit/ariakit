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
  tabRef?: (element: HTMLButtonElement | null) => void;
}

interface CapabilityFixtureProps {
  focusable?: boolean;
}

function CapabilityFixture({ focusable = true }: CapabilityFixtureProps) {
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
  );
}

function TypeFixture({ tabRef }: TypeFixtureProps) {
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
    </TabProvider>
  );
}

test("default tabs declare their native button type", async () => {
  const observedTypes: Array<string | null> = [];
  const tabRef = (element: HTMLButtonElement | null) => {
    if (!element) return;
    observedTypes.push(element.getAttribute("type"));
  };
  const { unmount } = await render(createElement(TypeFixture, { tabRef }));

  expect(q.tab("Default tab")).toHaveAttribute("type", "button");
  expect(observedTypes).toEqual(["button"]);
  expect(q.tab("Submit tab")).toHaveAttribute("type", "submit");
  expect(q.tab("Reset tab")).toHaveAttribute("type", "reset");
  expect(q.tab("Button tab")).toHaveAttribute("type", "button");
  expect(q.tab("Div tab")).not.toHaveAttribute("type");
  expect(q.tab("Hook tab")).not.toHaveAttribute("type");
  expect(q.button("Input command")).toHaveAttribute("type", "submit");

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

  await rerender(createElement(CapabilityFixture, { focusable: false }));
  expect(div).not.toHaveAttribute("tabindex");

  await rerender(createElement(CapabilityFixture, { focusable: true }));
  expect(div).toHaveAttribute("tabindex", "0");

  unmount();
});

test("server markup and hydration use the same native button type", async () => {
  const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previousActEnvironment = scope.IS_REACT_ACT_ENVIRONMENT;
  scope.IS_REACT_ACT_ENVIRONMENT = true;
  const element = createElement(TypeFixture, {});
  const container = document.createElement("div");
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    let serverErrors: Array<unknown[]> = [];
    try {
      container.innerHTML = renderToString(element);
      serverErrors = consoleError.mock.calls;
    } finally {
      consoleError.mockRestore();
    }
    const unexpectedServerErrors = serverErrors.filter(
      ([message]) =>
        !String(message).includes("useLayoutEffect does nothing on the server"),
    );
    expect(unexpectedServerErrors).toEqual([]);
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

    await act(async () => {
      root = hydrateRoot(container, element);
    });

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
  } finally {
    if (root) {
      await act(async () => root?.unmount());
    }
    container.remove();
    scope.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  }
});
