import { expect, test, vi } from "vitest";
import { q, render } from "../react.tsx";
import { select } from "../select.ts";

test("select", async () => {
  await render(
    <div>
      first <span>second</span> third
    </div>,
  );

  const element = q.text(/first/);
  const createNodeIterator = vi.spyOn(document, "createNodeIterator");
  const onSelectionChange = vi.fn();
  document.addEventListener("selectionchange", onSelectionChange);

  await select("second third", element);

  const selection = document.getSelection();

  expect(createNodeIterator).toHaveBeenCalledTimes(1);
  expect(onSelectionChange).toHaveBeenCalledTimes(1);
  expect(selection?.toString()).toBe("second third");
});
