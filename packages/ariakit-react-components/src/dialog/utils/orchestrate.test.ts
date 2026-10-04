import { afterEach, expect, test } from "vitest";
import {
  addOpenDialog,
  getEarlierOpenDialogElements,
  hasDialogAbove,
  notifyOpenDialogElementChange,
} from "./__open-dialogs.ts";
import { addToWalkTreeSnapshot } from "./__walk-tree-snapshot.ts";
import { markAndDisableTreeOutside } from "./disable-tree.ts";
import {
  isElementInside,
  isElementMarked,
  markTreeInside,
  markTreeOutside,
} from "./mark-tree-outside.ts";
import { assignStyle, setAttribute, setCSSProperty } from "./orchestrate.ts";
import { supportsInert } from "./supports-inert.ts";
import { restoreCleanups } from "./tree-cleanup.ts";
import {
  createWalkTreeSnapshot,
  walkTreeOutside,
} from "./walk-tree-outside.ts";

afterEach(() => {
  document.body.innerHTML = "";
});

function getElement(id: string) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Element not found: ${id}`);
  return element;
}

function getWalkedElementIds(id: string, elements: Array<Element | null>) {
  const ids: string[] = [];
  walkTreeOutside(id, elements, (element) => {
    ids.push(element.id);
  });
  return ids;
}

test("orchestrate restores cleanup stacks in LIFO order", () => {
  const element = document.createElement("div");
  element.setAttribute("data-value", "initial");

  const restoreOne = setAttribute(element, "data-value", "one");
  const restoreTwo = setAttribute(element, "data-value", "two");
  const restoreThree = setAttribute(element, "data-value", "three");

  expect(element.getAttribute("data-value")).toBe("three");

  restoreThree();

  expect(element.getAttribute("data-value")).toBe("two");

  restoreTwo();

  expect(element.getAttribute("data-value")).toBe("one");

  restoreOne();

  expect(element.getAttribute("data-value")).toBe("initial");
});

test("orchestrate defers the initial cleanup until it is current", () => {
  const element = document.createElement("div");
  element.setAttribute("role", "original");

  const restoreOne = setAttribute(element, "role", "one");
  const restoreTwo = setAttribute(element, "role", "two");

  restoreOne();

  expect(element.getAttribute("role")).toBe("two");

  restoreTwo();

  expect(element.getAttribute("role")).toBe("original");

  restoreOne();

  expect(element.getAttribute("role")).toBe("original");
});

test("orchestrate skips disposed entries when restoring previous cleanups", () => {
  const element = document.createElement("div");
  element.setAttribute("data-value", "initial");

  const restoreOne = setAttribute(element, "data-value", "one");
  const restoreTwo = setAttribute(element, "data-value", "two");
  const restoreThree = setAttribute(element, "data-value", "three");

  restoreTwo();

  expect(element.getAttribute("data-value")).toBe("three");

  restoreThree();

  expect(element.getAttribute("data-value")).toBe("one");

  restoreOne();

  expect(element.getAttribute("data-value")).toBe("initial");
});

test("orchestrate defers stale style cleanups", () => {
  const element = document.createElement("div");
  element.style.display = "flex";

  const restoreOne = assignStyle(element, { display: "block" });
  const restoreTwo = assignStyle(element, { display: "none" });

  restoreOne();

  expect(element.style.display).toBe("none");

  restoreTwo();

  expect(element.style.display).toBe("flex");
});

test("setCSSProperty restores the previous value with its priority", () => {
  const element = document.createElement("div");
  element.style.setProperty("overflow-y", "scroll", "important");

  const restore = setCSSProperty(element, "overflow-y", "hidden");

  expect(element.style.getPropertyValue("overflow-y")).toBe("hidden");

  restore();

  expect(element.style.getPropertyValue("overflow-y")).toBe("scroll");
  expect(element.style.getPropertyPriority("overflow-y")).toBe("important");
});

test("orchestrate keeps element and key cleanup stacks independent", () => {
  const element = document.createElement("div");
  const otherElement = document.createElement("div");

  const restoreElementValue = setAttribute(element, "data-value", "value");
  setAttribute(element, "data-other", "other");
  setAttribute(otherElement, "data-value", "other-value");

  restoreElementValue();

  expect(element.hasAttribute("data-value")).toBe(false);
  expect(element.getAttribute("data-other")).toBe("other");
  expect(otherElement.getAttribute("data-value")).toBe("other-value");
});

test("walkTreeOutside skips nested elements that share an ancestor", () => {
  document.body.innerHTML = `
    <div id="root">
      <section id="outside"></section>
      <div id="dialog">
        <button id="button"></button>
      </div>
      <section id="sibling"></section>
    </div>
  `;

  const dialog = getElement("dialog");
  const button = getElement("button");
  const walked: string[] = [];

  walkTreeOutside("dialog", [dialog, button], (element, originalElement) => {
    walked.push(`${originalElement.id}:${element.id}`);
  });

  expect(walked).toEqual(["dialog:outside", "dialog:sibling"]);
});

test("walkTreeOutside skips elements outside the active snapshot", () => {
  document.body.innerHTML = `
    <div id="root">
      <div id="dialog"></div>
      <section id="before"></section>
    </div>
  `;

  const dialog = getElement("dialog");
  const root = getElement("root");
  const restoreSnapshot = createWalkTreeSnapshot("dialog", [dialog]);
  const after = document.createElement("section");
  after.id = "after";
  root.append(after);

  expect(getWalkedElementIds("dialog", [dialog])).toEqual(["before"]);

  restoreSnapshot();

  expect(getWalkedElementIds("dialog", [dialog])).toEqual(["before", "after"]);
});

test("addToWalkTreeSnapshot handles a very large number of elements", () => {
  // Passing every cleanup to one function call as an argument overflows the
  // stack in the engines that limit the number of arguments.
  const elements = Array.from({ length: 200_000 }, () =>
    document.createElement("section"),
  );

  let restoreSnapshot: (() => void) | undefined;
  expect(() => {
    restoreSnapshot = addToWalkTreeSnapshot("dialog", elements);
  }).not.toThrow();

  restoreSnapshot?.();
});

test("walkTreeOutside walks elements added to the snapshot", () => {
  document.body.innerHTML = `
    <div id="root">
      <div id="dialog"></div>
      <section id="earlier"></section>
    </div>
  `;

  const dialog = getElement("dialog");
  const earlier = getElement("earlier");
  const root = getElement("root");
  const restoreSnapshot = createWalkTreeSnapshot("dialog", [dialog]);

  // React replaces the element that was in the snapshot, and the page adds an
  // unrelated element.
  const replacement = document.createElement("section");
  replacement.id = "replacement";
  earlier.replaceWith(replacement);
  const later = document.createElement("section");
  later.id = "later";
  root.append(later);

  expect(getWalkedElementIds("dialog", [dialog])).toEqual([]);

  const restoreAdded = addToWalkTreeSnapshot("dialog", [replacement]);

  expect(getWalkedElementIds("dialog", [dialog])).toEqual(["replacement"]);

  restoreAdded();

  expect(getWalkedElementIds("dialog", [dialog])).toEqual([]);

  restoreSnapshot();
});

test("markTreeOutside skips backdrops and restores marks", () => {
  document.body.innerHTML = `
    <div id="root">
      <div id="dialog" data-dialog></div>
      <section id="outside">
        <span id="outside-child"></span>
      </section>
      <div id="backdrop" data-backdrop="dialog"></div>
    </div>
  `;

  const dialog = getElement("dialog");
  const outside = getElement("outside");
  const outsideChild = getElement("outside-child");
  const backdrop = getElement("backdrop");

  const marks = markTreeOutside("dialog", [dialog]);

  expect(isElementMarked(outside, "dialog")).toBe(true);
  expect(isElementMarked(outsideChild, "dialog")).toBe(true);
  expect(isElementMarked(backdrop, "dialog")).toBe(false);

  restoreCleanups(marks);

  expect(isElementMarked(outside, "dialog")).toBe(false);
  expect(isElementMarked(outsideChild, "dialog")).toBe(false);
  expect(isElementMarked(backdrop, "dialog")).toBe(false);
});

test("markTreeInside marks the given elements and restores them", () => {
  document.body.innerHTML = `
    <div id="root">
      <div id="dialog" data-dialog></div>
      <section id="persistent">
        <span id="persistent-child"></span>
      </section>
      <section id="outside"></section>
    </div>
  `;

  const dialog = getElement("dialog");
  const persistent = getElement("persistent");
  const persistentChild = getElement("persistent-child");
  const outside = getElement("outside");

  const restoreInsideMarks = markTreeInside(dialog, [dialog, persistent]);
  const marks = markTreeOutside("dialog", [dialog, persistent]);

  expect(isElementInside(dialog, dialog)).toBe(true);
  expect(isElementInside(persistent, dialog)).toBe(true);
  // Descendants of inside elements are inside too, even when added after the
  // dialog opens.
  expect(isElementInside(persistentChild, dialog)).toBe(true);
  expect(isElementInside(outside, dialog)).toBe(false);
  expect(isElementMarked(persistent, "dialog")).toBe(false);
  expect(isElementMarked(outside, "dialog")).toBe(true);

  restoreCleanups(marks);
  restoreInsideMarks();

  expect(isElementInside(dialog, dialog)).toBe(false);
  expect(isElementInside(persistent, dialog)).toBe(false);
  expect(isElementInside(persistentChild, dialog)).toBe(false);
});

test("markTreeInside keeps same-id dialogs isolated", () => {
  const dialogOne = document.createElement("div");
  const dialogTwo = document.createElement("div");
  const persistentOne = document.createElement("div");
  const persistentTwo = document.createElement("div");
  dialogOne.id = "dialog";
  dialogTwo.id = "dialog";

  const restoreOne = markTreeInside(dialogOne, [dialogOne, persistentOne]);
  const restoreTwo = markTreeInside(dialogTwo, [dialogTwo, persistentTwo]);

  expect(isElementInside(persistentOne, dialogOne)).toBe(true);
  expect(isElementInside(persistentTwo, dialogOne)).toBe(false);
  expect(isElementInside(persistentOne, dialogTwo)).toBe(false);
  expect(isElementInside(persistentTwo, dialogTwo)).toBe(true);

  restoreTwo();
  restoreOne();
});

test("markTreeOutside restores previous marks after nested cleanup", () => {
  document.body.innerHTML = `
    <div id="root">
      <div id="dialog-one" data-dialog></div>
      <div id="dialog-two" data-dialog></div>
      <section id="outside"></section>
    </div>
  `;

  const dialogOne = getElement("dialog-one");
  const dialogTwo = getElement("dialog-two");
  const outside = getElement("outside");

  const marksOne = markTreeOutside("one", [dialogOne]);
  const marksTwo = markTreeOutside("two", [dialogTwo]);

  expect(isElementMarked(outside, "one")).toBe(true);
  expect(isElementMarked(outside, "two")).toBe(true);

  restoreCleanups(marksTwo);

  expect(isElementMarked(outside, "one")).toBe(true);
  expect(isElementMarked(outside, "two")).toBe(false);

  restoreCleanups(marksOne);

  expect(isElementMarked(outside, "one")).toBe(false);
  expect(isElementMarked(outside, "two")).toBe(false);
});

test("markAndDisableTreeOutside skips focus traps and restores disabled elements", () => {
  document.body.innerHTML = `
    <div id="root">
      <div id="dialog"></div>
      <span id="focus-trap" data-focus-trap="dialog"></span>
      <section id="outside">
        <button id="button">Button</button>
      </section>
    </div>
  `;

  const dialog = getElement("dialog");
  const focusTrap = getElement("focus-trap");
  const outside = getElement("outside");

  const tree = markAndDisableTreeOutside("dialog", [dialog]);

  expect(isElementMarked(outside, "dialog")).toBe(true);
  // Focus traps are marked as outside the dialog, but not disabled.
  expect(isElementMarked(focusTrap, "dialog")).toBe(true);

  if (supportsInert()) {
    expect(outside.inert).toBe(true);
    expect(focusTrap.inert).toBe(false);
  } else {
    expect(outside.getAttribute("aria-hidden")).toBe("true");
    expect(outside.style.pointerEvents).toBe("none");
    expect(focusTrap.hasAttribute("aria-hidden")).toBe(false);
    expect(focusTrap.style.pointerEvents).toBe("");
  }

  restoreCleanups(tree);

  expect(isElementMarked(outside, "dialog")).toBe(false);
  expect(isElementMarked(focusTrap, "dialog")).toBe(false);

  if (supportsInert()) {
    expect(outside.inert).toBe(false);
  } else {
    expect(outside.hasAttribute("aria-hidden")).toBe(false);
    expect(outside.style.pointerEvents).toBe("");
  }
});

// https://github.com/ariakit/ariakit/issues/7697
test("markAndDisableTreeOutside keeps disabled elements between walks", () => {
  document.body.innerHTML = `
    <div id="root">
      <div id="dialog"></div>
      <section id="outside">
        <button>Button</button>
      </section>
      <section id="container" role="group">
        <div id="nested"></div>
        <div id="nested-sibling"></div>
      </section>
    </div>
  `;

  const dialog = getElement("dialog");
  const outside = getElement("outside");
  const container = getElement("container");
  const nested = getElement("nested");
  const nestedSibling = getElement("nested-sibling");

  const isDisabled = (element: HTMLElement) => {
    if (supportsInert()) {
      return element.inert;
    }
    return element.getAttribute("aria-hidden") === "true";
  };

  const tree = markAndDisableTreeOutside("dialog", [dialog]);

  expect(isDisabled(outside)).toBe(true);
  expect(isDisabled(container)).toBe(true);

  const observer = new MutationObserver(() => {});
  observer.observe(outside, { attributes: true, subtree: true });

  // The nested dialog makes its container part of the modal context.
  const nestedTree = markAndDisableTreeOutside(
    "dialog",
    [dialog, nested],
    tree,
  );

  expect(observer.takeRecords()).toEqual([]);
  expect(isDisabled(outside)).toBe(true);
  expect(isElementMarked(outside, "dialog")).toBe(true);
  expect(isDisabled(container)).toBe(false);
  expect(isElementMarked(container, "dialog")).toBe(true);
  expect(container.getAttribute("role")).toBe("none");
  expect(isDisabled(nestedSibling)).toBe(true);

  const finalTree = markAndDisableTreeOutside("dialog", [dialog], nestedTree);

  expect(observer.takeRecords()).toEqual([]);
  expect(isDisabled(outside)).toBe(true);
  expect(isDisabled(container)).toBe(true);
  expect(container.getAttribute("role")).toBe("group");
  expect(isDisabled(nestedSibling)).toBe(false);

  restoreCleanups(finalTree);
  observer.disconnect();

  expect(isDisabled(outside)).toBe(false);
  expect(isDisabled(container)).toBe(false);
  expect(isElementMarked(outside, "dialog")).toBe(false);
  expect(isElementMarked(container, "dialog")).toBe(false);
});

// https://github.com/ariakit/ariakit/issues/7697
test("markAndDisableTreeOutside disables tabbable elements again without inert", () => {
  const inert = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "inert");
  if (!inert) throw new Error("The test environment does not support inert");
  // @ts-expect-error Remove inert to exercise the fallback.
  delete HTMLElement.prototype.inert;

  try {
    document.body.innerHTML = `
      <div id="root">
        <div id="dialog"></div>
        <section id="outside"></section>
        <section id="container">
          <div id="nested"></div>
          <div id="nested-sibling">
            <button id="button">Button</button>
          </div>
        </section>
      </div>
    `;

    const dialog = getElement("dialog");
    const container = getElement("container");
    const nested = getElement("nested");
    const nestedSibling = getElement("nested-sibling");
    const button = getElement("button");
    const outside = getElement("outside");

    const tree = markAndDisableTreeOutside("dialog", [dialog]);

    expect(container.getAttribute("aria-hidden")).toBe("true");
    expect(button.getAttribute("tabindex")).toBe("-1");

    // A button that mounts in an element that stays disabled in the next walk.
    const lateButton = document.createElement("button");
    outside.append(lateButton);

    const nestedTree = markAndDisableTreeOutside(
      "dialog",
      [dialog, nested],
      tree,
    );

    expect(outside.getAttribute("aria-hidden")).toBe("true");
    expect(lateButton.getAttribute("tabindex")).toBe("-1");
    expect(container.hasAttribute("aria-hidden")).toBe(false);
    expect(nestedSibling.getAttribute("aria-hidden")).toBe("true");
    expect(button.getAttribute("tabindex")).toBe("-1");

    const finalTree = markAndDisableTreeOutside("dialog", [dialog], nestedTree);

    expect(container.getAttribute("aria-hidden")).toBe("true");
    expect(nestedSibling.hasAttribute("aria-hidden")).toBe(false);
    expect(button.getAttribute("tabindex")).toBe("-1");
    expect(lateButton.getAttribute("tabindex")).toBe("-1");

    restoreCleanups(finalTree);

    expect(container.hasAttribute("aria-hidden")).toBe(false);
    expect(button.hasAttribute("tabindex")).toBe(false);
    expect(lateButton.hasAttribute("tabindex")).toBe(false);
  } finally {
    Object.defineProperty(HTMLElement.prototype, "inert", inert);
  }
});

test("hasDialogAbove counts a mark that doesn't come from the open dialogs", () => {
  document.body.innerHTML = `
    <div id="root">
      <div id="dialog" data-dialog></div>
      <div id="layer"></div>
    </div>
  `;

  const dialog = getElement("dialog");
  const layer = getElement("layer");

  const removeDialog = addOpenDialog({ current: dialog });
  const dialogMarks = markTreeOutside("dialog", [dialog]);

  expect(hasDialogAbove(dialog)).toBe(false);

  // Another copy of this module shares the marks, but not the open dialogs.
  const layerMarks = markTreeOutside("layer", [layer]);

  expect(hasDialogAbove(dialog)).toBe(true);

  restoreCleanups(layerMarks);

  expect(hasDialogAbove(dialog)).toBe(false);

  restoreCleanups(dialogMarks);
  removeDialog();
});

test("getEarlierOpenDialogElements returns the elements of the dialogs that opened before", () => {
  document.body.innerHTML = `
    <div id="first"></div>
    <div id="parent">
      <div id="child"></div>
    </div>
    <div id="last"></div>
  `;

  const first = getElement("first");
  const parent = getElement("parent");
  const child = getElement("child");
  const last = getElement("last");

  const removeFirst = addOpenDialog({ current: first });
  const removeParent = addOpenDialog({ current: parent });
  const childRef = { current: child };
  const removeChild = addOpenDialog(childRef);
  const lastRef = { current: last };
  const removeLast = addOpenDialog(lastRef);

  expect(getEarlierOpenDialogElements(lastRef)).toEqual([first, parent, child]);
  // A dialog that contains the given one is not outside it.
  expect(getEarlierOpenDialogElements(childRef)).toEqual([first]);

  // A disconnected element, such as the one that React replaced, is skipped.
  parent.remove();

  expect(getEarlierOpenDialogElements(lastRef)).toEqual([first]);

  removeLast();
  removeChild();
  removeParent();
  removeFirst();
});

test("notifyOpenDialogElementChange notifies only the dialogs that opened after", () => {
  const calls: string[] = [];
  const firstRef = { current: null };
  const secondRef = { current: null };
  const thirdRef = { current: null };

  const removeFirst = addOpenDialog(firstRef, () => calls.push("first"));
  const removeSecond = addOpenDialog(secondRef, () => calls.push("second"));
  const removeThird = addOpenDialog(thirdRef, () => calls.push("third"));

  notifyOpenDialogElementChange(secondRef);

  expect(calls).toEqual(["third"]);

  removeThird();
  removeSecond();
  removeFirst();
});
