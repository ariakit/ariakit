import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("registers uncontrolled items", async () => {
  await expect
    .poll(() => q.status("Uncontrolled items"))
    .toHaveTextContent("3");
});

test("reports controlled store items", async () => {
  await expect.poll(() => q.status("Controlled items")).toHaveTextContent("3");
});

test("reports controlled provider items", async () => {
  await expect.poll(() => q.status("Provider items")).toHaveTextContent("3");
});

test("customizes a registered item with getItem", async () => {
  await expect.poll(() => q.status("Custom items")).toHaveTextContent("1");
});

test("excludes an item when registration is disabled", async () => {
  await expect.poll(() => q.status("Registered items")).toHaveTextContent("2");
});
