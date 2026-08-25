import { q, render } from "@ariakit/test/react";
import { expect, test } from "vitest";
import { List, ListDisclosure, ListItem } from "./list.react.tsx";

// Regression coverage: a truthiness check passed falsy labels like {0}
// straight through, so the plain DisclosureButton rendered instead of
// ListDisclosureButton and the list indicator defaults were lost.
test("renders falsy labels through the list disclosure button", async () => {
  await render(<ListDisclosure button={0}>content</ListDisclosure>);
  const button = q.button();
  expect(button).toHaveAccessibleName("0");
  const indicator = button?.querySelector("[data-disclosure-indicator]");
  expect(indicator).toBeInTheDocument();
  // The list button places its indicator after the label, unlike the plain
  // disclosure button's start-positioned default.
  expect(button?.firstElementChild).not.toBe(indicator);
});

// Regression coverage: the bullet and the number repeat what the list element
// already conveys, so only a check slot may reach the accessible name. A
// stray role on the plain marker would announce an image on every row.
test("keeps a plain marker out of the accessible tree", async () => {
  await render(
    <List>
      <ListItem>Install the package</ListItem>
    </List>,
  );
  const marker = q.listitem()?.firstElementChild;
  expect(marker).toHaveAttribute("aria-hidden", "true");
  expect(marker).not.toHaveAttribute("role");
  expect(q.img.all()).toHaveLength(0);
});

// The wrapper has to stay a span: the block-mode variants detect block
// children with :has(:where(p, div, ...)), so a div would put every list and
// every item into blocks mode.
test("wraps the item's own children in a span", async () => {
  await render(
    <List>
      <ListItem>Configure the styles</ListItem>
    </List>,
  );
  const content = q.listitem("Configure the styles")?.lastElementChild;
  expect(content?.tagName).toBe("SPAN");
  expect(content).toHaveTextContent("Configure the styles");
});

// The segment that joins ordered blocks rows is the reason the connector is a
// component at all, and the list decides in CSS whether it paints, so the item
// has to render it on every row.
test("renders a connector between the marker and the content", async () => {
  await render(
    <List ordered>
      <ListItem>Review the gallery</ListItem>
    </List>,
  );
  const connector = q.listitem("Review the gallery")?.children[1];
  expect(connector?.className).toContain("--list-connector-gap");
  expect(connector).toHaveAttribute("aria-hidden", "true");
});

test("exposes the check state of a checked item", async () => {
  await render(
    <List>
      <ListItem checked>Install the package</ListItem>
    </List>,
  );
  expect(q.img("Checked")).toBeInTheDocument();
});

// Regression coverage: the list disclosure adds its own connector through the
// decoration slot, which silently dropped a caller's decoration when it
// overwrote the prop instead of composing with it.
test("keeps a caller's decoration alongside the list connector", async () => {
  await render(
    <ListDisclosure button="Open" decoration={<span data-testid="theirs" />}>
      content
    </ListDisclosure>,
  );
  const root = q.button("Open")?.parentElement;
  expect(root?.querySelector("[data-testid=theirs]")).toBeInTheDocument();
  // The connector is the reason the slot exists, so it has to survive too.
  const connector = root?.querySelector("[class*='--list-connector-gap']");
  expect(connector).toBeInTheDocument();
});

// Regression coverage: the button shipped once with the marker as a plain
// sibling of the label, which took :first-child from the label's first child
// the same way it did in the item.
test("wraps the disclosure button's label in a span", async () => {
  await render(
    <ListDisclosure button="Review the gallery">content</ListDisclosure>,
  );
  const label = q.button("Review the gallery")?.querySelector("[id$='-label']");
  expect(label?.lastElementChild?.tagName).toBe("SPAN");
  expect(label?.lastElementChild).toHaveTextContent("Review the gallery");
});
