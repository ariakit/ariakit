import { afterEach, expect, test } from "vitest";
import {
  addOpenDialog,
  getEarlierOpenDialogElements,
  hasDialogAbove,
  notifyOpenDialogElementChange,
  removeOpenDialog,
} from "./__open-dialogs.ts";
import {
  addToWalkTreeSnapshot,
  getSnapshotAncestorPropertyName,
} from "./__walk-tree-snapshot.ts";
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

// https://github.com/ariakit/ariakit/issues/7774
test("walkTreeOutside walks the snapshot children of the elements that the dialog left", () => {
  document.body.innerHTML = `
    <div id="root">
      <section id="before"></section>
      <div id="parent">
        <div id="dialog"></div>
        <section id="sibling"></section>
      </div>
    </div>
  `;

  const dialog = getElement("dialog");
  const root = getElement("root");
  const parent = getElement("parent");
  const restoreSnapshot = createWalkTreeSnapshot("dialog", [dialog]);

  // The page adds an element next to the dialog, and then the dialog moves to a
  // new portal node.
  const later = document.createElement("section");
  later.id = "later";
  parent.append(later);
  const portal = document.createElement("div");
  portal.id = "portal";
  document.body.append(portal);
  portal.append(dialog);

  const walk = () => {
    const walked: string[] = [];
    const ancestors: string[] = [];
    walkTreeOutside(
      "dialog",
      [dialog],
      (element) => walked.push(element.id),
      (ancestor) => ancestors.push(ancestor.id || ancestor.tagName),
    );
    return { walked, ancestors };
  };

  const result = walk();
  // The snapshot is on the body element, which the other tests use too, so it
  // goes away before an assertion can fail.
  restoreSnapshot();

  // The root and the parent had the dialog inside them when the snapshot was
  // taken, so the walk goes through them like through the current ancestors.
  expect(result).toEqual({
    walked: ["before", "sibling"],
    ancestors: ["portal", "BODY", "root", "parent"],
  });
  // Without a snapshot, the walk has every element outside the dialog, so it
  // can't show that the record of the former ancestors is gone.
  expect(walk()).toEqual({ walked: ["root"], ancestors: ["portal", "BODY"] });
  const ancestorProperty = getSnapshotAncestorPropertyName("dialog");
  expect(Object.hasOwn(root, ancestorProperty)).toBe(false);
  expect(Object.hasOwn(parent, ancestorProperty)).toBe(false);
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

  const dialogRef = { current: dialog };
  addOpenDialog(dialogRef, {
    getOutsideCleanups: () => dialogMarks,
  });
  const dialogMarks = markTreeOutside("dialog", [dialog]);

  expect(hasDialogAbove(dialogRef)).toBe(false);

  // Another copy of this module shares the marks, but not the open dialogs.
  const layerMarks = markTreeOutside("layer", [layer]);

  expect(hasDialogAbove(dialogRef)).toBe(true);

  restoreCleanups(layerMarks);

  expect(hasDialogAbove(dialogRef)).toBe(false);

  restoreCleanups(dialogMarks);
  removeOpenDialog(dialogRef);
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

  const firstRef = { current: first };
  const parentRef = { current: parent };
  const childRef = { current: child };
  const lastRef = { current: last };
  addOpenDialog(firstRef);
  addOpenDialog(parentRef);
  addOpenDialog(childRef);
  addOpenDialog(lastRef);

  expect(getEarlierOpenDialogElements(lastRef)).toEqual([first, parent, child]);
  // A dialog that contains the given one is not outside it.
  expect(getEarlierOpenDialogElements(childRef)).toEqual([first]);

  // A disconnected element, such as the one that React replaced, is skipped.
  parent.remove();

  expect(getEarlierOpenDialogElements(lastRef)).toEqual([first]);

  removeOpenDialog(lastRef);
  removeOpenDialog(childRef);
  removeOpenDialog(parentRef);
  removeOpenDialog(firstRef);
});

// https://github.com/ariakit/ariakit/issues/7733
test("getEarlierOpenDialogElements returns the portal nodes of the dialogs that opened before", () => {
  document.body.innerHTML = `
    <div id="portal">
      <div id="dialog"></div>
      <div id="nested"></div>
    </div>
    <div id="last"></div>
  `;

  const dialog = getElement("dialog");
  const nested = getElement("nested");
  const last = getElement("last");

  let portalNode: Element | null = getElement("portal");
  const dialogRef = { current: dialog };
  const nestedRef = { current: nested };
  const lastRef = { current: last };
  addOpenDialog(dialogRef, { getPortalNode: () => portalNode });
  addOpenDialog(nestedRef);
  addOpenDialog(lastRef);

  // The tree walk reaches a dialog in a portal through its portal node.
  expect(getEarlierOpenDialogElements(lastRef)).toEqual([
    portalNode,
    dialog,
    nested,
  ]);
  // A portal node that contains the given dialog is not outside it, but the
  // dialog in that portal node is.
  expect(getEarlierOpenDialogElements(nestedRef)).toEqual([dialog]);

  // The portal node can change while the dialog stays open.
  portalNode = null;

  expect(getEarlierOpenDialogElements(lastRef)).toEqual([dialog, nested]);

  removeOpenDialog(lastRef);
  removeOpenDialog(nestedRef);
  removeOpenDialog(dialogRef);
});

// https://github.com/ariakit/ariakit/issues/7751
test("getEarlierOpenDialogElements returns the wrapper elements of the dialogs that opened before", () => {
  document.body.innerHTML = `
    <div id="wrapper">
      <div id="dialog">
        <div id="nested"></div>
      </div>
    </div>
    <div id="last"></div>
  `;

  const dialog = getElement("dialog");
  const nested = getElement("nested");
  const last = getElement("last");

  let wrapperElement: Element | null = getElement("wrapper");
  const dialogRef = { current: dialog };
  const nestedRef = { current: nested };
  const lastRef = { current: last };
  addOpenDialog(dialogRef, { getWrapperElement: () => wrapperElement });
  addOpenDialog(nestedRef);
  addOpenDialog(lastRef);

  // The tree walk reaches a dialog in a wrapper element through that wrapper.
  expect(getEarlierOpenDialogElements(lastRef)).toEqual([
    wrapperElement,
    dialog,
    nested,
  ]);
  // A wrapper element that contains the given dialog is not outside it.
  expect(getEarlierOpenDialogElements(nestedRef)).toEqual([]);

  // The wrapper element can change while the dialog stays open.
  wrapperElement = null;

  expect(getEarlierOpenDialogElements(lastRef)).toEqual([dialog, nested]);

  removeOpenDialog(lastRef);
  removeOpenDialog(nestedRef);
  removeOpenDialog(dialogRef);
});

test("notifyOpenDialogElementChange notifies only the dialogs that opened after", () => {
  const calls: string[] = [];
  const firstRef = { current: null };
  const secondRef = { current: null };
  const thirdRef = { current: null };

  addOpenDialog(firstRef, {
    onEarlierDialogElementChange: () => calls.push("first"),
  });
  addOpenDialog(secondRef, {
    onEarlierDialogElementChange: () => calls.push("second"),
  });
  addOpenDialog(thirdRef, {
    onEarlierDialogElementChange: () => calls.push("third"),
  });

  notifyOpenDialogElementChange(secondRef);

  expect(calls).toEqual(["third"]);

  removeOpenDialog(thirdRef);
  removeOpenDialog(secondRef);
  removeOpenDialog(firstRef);
});

// https://github.com/ariakit/ariakit/issues/7726
test.each(["after", "between", "before"])(
  "hasDialogAbove ignores a dialog in another root with the same id that opens %s the dialogs that mark each other",
  (position) => {
    document.body.innerHTML = `
      <div id="root">
        <div id="notice" data-dialog></div>
        <div id="listbox" data-dialog></div>
      </div>
      <div id="host"></div>
    `;

    const notice = getElement("notice");
    const listbox = getElement("listbox");
    const shadowRoot = getElement("host").attachShadow({ mode: "open" });
    const shadowNotice = document.createElement("div");
    // Ids are unique only in their root, so this one can reuse the id.
    shadowNotice.id = "notice";
    shadowNotice.setAttribute("data-dialog", "");
    shadowRoot.append(shadowNotice);

    const noticeRef = { current: notice };
    const listboxRef = { current: listbox };
    const shadowNoticeRef = { current: shadowNotice };

    const openOrders: Record<string, Array<typeof noticeRef>> = {
      after: [noticeRef, listboxRef, shadowNoticeRef],
      between: [noticeRef, shadowNoticeRef, listboxRef],
      before: [shadowNoticeRef, noticeRef, listboxRef],
    };
    const openOrder = openOrders[position] ?? [];

    // The shadow dialog is alone in its root, so it marks nothing.
    const marks = new Map([
      [noticeRef, markTreeOutside("notice", [notice])],
      [listboxRef, markTreeOutside("listbox", [listbox])],
      [shadowNoticeRef, markTreeOutside("notice", [shadowNotice])],
    ]);
    for (const dialogRef of openOrder) {
      addOpenDialog(dialogRef, {
        getOutsideCleanups: () => marks.get(dialogRef),
      });
    }

    expect(isElementMarked(listbox, "notice")).toBe(true);
    expect(hasDialogAbove(listboxRef)).toBe(false);
    expect(hasDialogAbove(noticeRef)).toBe(true);
    expect(hasDialogAbove(shadowNoticeRef)).toBe(false);

    for (const dialogRef of openOrder) {
      removeOpenDialog(dialogRef);
    }
    for (const mark of marks.values()) {
      restoreCleanups(mark);
    }
  },
);

// https://github.com/ariakit/ariakit/issues/7726
test("hasDialogAbove counts the marks of a popup in another root", () => {
  document.body.innerHTML = `
    <div id="popover" data-dialog></div>
    <div id="host"></div>
  `;

  const popover = getElement("popover");
  const shadowRoot = getElement("host").attachShadow({ mode: "open" });
  const dialog = document.createElement("div");
  dialog.id = "dialog";
  dialog.setAttribute("data-dialog", "");
  const disclosure = document.createElement("button");
  dialog.append(disclosure);
  shadowRoot.append(dialog);

  const dialogRef = { current: dialog };
  const popoverRef = { current: popover };
  addOpenDialog(dialogRef);
  addOpenDialog(popoverRef, {
    getOutsideCleanups: () => marks,
  });

  // The popover renders in the document, but its disclosure is in the dialog,
  // so the walk marks the dialog as an ancestor of the disclosure.
  const marks = markTreeOutside("popover", [disclosure, popover]);

  expect(hasDialogAbove(dialogRef)).toBe(true);
  expect(hasDialogAbove(popoverRef)).toBe(false);

  restoreCleanups(marks);
  removeOpenDialog(popoverRef);
  removeOpenDialog(dialogRef);
});

test("hasDialogAbove counts the marks of a modal dialog", () => {
  document.body.innerHTML = `
    <div id="root">
      <div id="dialog" data-dialog></div>
      <div id="modal" data-dialog></div>
    </div>
  `;

  const dialog = getElement("dialog");
  const modal = getElement("modal");
  const dialogRef = { current: dialog };
  const modalRef = { current: modal };
  addOpenDialog(dialogRef, {
    getOutsideCleanups: () => dialogMarks,
  });
  addOpenDialog(modalRef, {
    getOutsideCleanups: () => modalMarks,
  });

  // The dialogs mark each other, so the one that opened last is above.
  const dialogMarks = markTreeOutside("dialog", [dialog]);
  const modalMarks = markAndDisableTreeOutside("modal", [modal]);

  expect(hasDialogAbove(dialogRef)).toBe(true);
  expect(hasDialogAbove(modalRef)).toBe(false);

  restoreCleanups(modalMarks);
  restoreCleanups(dialogMarks);
  removeOpenDialog(modalRef);
  removeOpenDialog(dialogRef);
});
