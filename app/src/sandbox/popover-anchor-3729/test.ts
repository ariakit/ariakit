import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/3729
test.each(["Disclosure first", "Anchor first", "Provider store"])(
  "keeps the explicit anchor when the %s disclosure is clicked",
  async (label) => {
    const anchor = q.status.ensure(`${label} current anchor`);
    expect(anchor).toHaveTextContent("explicit");

    await click(q.button(`Open ${label}`));

    expect(anchor).toHaveTextContent("explicit");
  },
);

test("clears the current anchor when the explicit anchor unmounts", async () => {
  const label = "Disclosure first";
  const anchor = q.status.ensure(`${label} current anchor`);

  await click(q.button(`Open ${label}`));
  await click(q.button(`Remove ${label} anchor`));

  expect(anchor).toBeEmptyDOMElement();
});

test("preserves the MenuButton interaction anchor", async () => {
  const anchor = q.status.ensure("Menu current anchor");
  expect(anchor).toHaveTextContent("explicit");

  await click(q.button("Open Menu"));

  expect(anchor).toHaveTextContent("menu-button");
});

test("preserves a consumer MenuButton anchor override", async () => {
  const anchor = q.status.ensure("Override Menu current anchor");

  await click(q.button("Open Override Menu"));

  expect(anchor).toHaveTextContent("group");
});
