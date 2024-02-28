import { click, q } from "@ariakit/test";
import { act } from "react-dom/test-utils";

function matchText(text: string): HTMLElement | null {
  const search = (node: Node): HTMLElement | null => {
    if (
      node.nodeType === Node.TEXT_NODE &&
      node.nodeValue &&
      node.nodeValue.toLowerCase().includes(text.toLowerCase())
    ) {
      const parentElement = node.parentElement;
      const closestHidden = parentElement?.closest("[hidden='until-found']");
      if (parentElement && closestHidden) {
        closestHidden.removeAttribute("hidden");
        const event = new Event("beforematch", { bubbles: true });
        closestHidden.dispatchEvent(event);
      }
      return parentElement;
    }
    for (const childNode of node.childNodes) {
      const foundElement = search(childNode);
      if (foundElement) return foundElement;
    }
    return null;
  };
  return search(document.body);
}

test("automatically expand disclosure when using browser search", async () => {
  const wrapper = document.querySelector(".content-wrapper");

  expect(wrapper).not.toBeVisible();
  expect(q.button()).toHaveAttribute("aria-expanded", "false");

  act(() => matchText("parts"));

  expect(wrapper).toBeVisible();
  expect(q.button()).toHaveAttribute("aria-expanded", "true");

  await click(q.button());

  expect(wrapper).not.toBeVisible();
  expect(q.button()).toHaveAttribute("aria-expanded", "false");
});
