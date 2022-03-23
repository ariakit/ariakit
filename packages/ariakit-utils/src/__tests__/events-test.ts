import {
  addGlobalEventListener,
  fireBlurEvent,
  fireClickEvent,
  fireEvent,
  fireKeyboardEvent,
  isFocusEventOutside,
  isPortalEvent,
  isSelfTarget,
  queueBeforeEvent,
} from "ariakit-utils/events";

test("isPortalEvent", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="parent">
      <div id="child" />
    </div>
    <div id="portal" />
  `;
  const parent = document.getElementById("parent");
  const child = document.getElementById("child");
  const portal = document.getElementById("portal");

  const fakeEventParentChild = {
    currentTarget: parent,
    target: child,
  } as any;
  expect(isPortalEvent(fakeEventParentChild)).toBe(false);

  const fakeEventParentParent = {
    currentTarget: parent,
    target: parent,
  } as any;
  expect(isPortalEvent(fakeEventParentParent)).toBe(false);

  const fakeEventPortalParent = {
    currentTarget: portal,
    target: parent,
  } as any;
  expect(isPortalEvent(fakeEventPortalParent)).toBe(true);

  const fakeEventPortalChild = {
    currentTarget: portal,
    target: child,
  } as any;
  expect(isPortalEvent(fakeEventPortalChild)).toBe(true);

  document.body.innerHTML = initialInnerHTML;
});

test("isSelfTarget", () => {
  const element = document.createElement("div");
  const element2 = document.createElement("div");

  const fakeEvent = {
    currentTarget: element,
    target: element,
  } as any;
  expect(isSelfTarget(fakeEvent)).toBe(true);

  const fakeEvent2 = {
    currentTarget: element,
    target: element2,
  } as any;
  expect(isSelfTarget(fakeEvent2)).toBe(false);
});

test("fireEvent", () => {
  const element = document.createElement("div");
  const event = new Event("blur");
  const dispatchEventSpy = jest.spyOn(element, "dispatchEvent");

  expect(fireEvent(element, "blur")).toBe(true);
  expect(dispatchEventSpy).toHaveBeenCalledWith(event);

  dispatchEventSpy.mockRestore();
});

test("fireBlurEvent", () => {
  const element = document.createElement("div");
  const event = new FocusEvent("blur");
  const dispatchEventSpy = jest.spyOn(element, "dispatchEvent");

  expect(fireBlurEvent(element)).toBe(true);
  expect(dispatchEventSpy).toHaveBeenCalledWith(event);

  dispatchEventSpy.mockRestore();
});

test("fireKeyboardEvent", () => {
  const element = document.createElement("div");
  const event = new KeyboardEvent("keydown", {
    key: "ArrowDown",
    shiftKey: true,
  });
  const dispatchEventSpy = jest.spyOn(element, "dispatchEvent");

  expect(fireKeyboardEvent(element, "keydown", { key: "ArrowDown" })).toBe(
    true
  );
  expect(dispatchEventSpy).toHaveBeenCalledWith(event);

  dispatchEventSpy.mockRestore();
});

test("fireClickEvent", () => {
  const element = document.createElement("div");
  const event = new MouseEvent("click");
  const dispatchEventSpy = jest.spyOn(element, "dispatchEvent");

  expect(fireClickEvent(element)).toBe(true);
  expect(dispatchEventSpy).toHaveBeenCalledWith(event);

  // PointerEvent Defined Case
  const originalPointerEvent =
    Object.getOwnPropertyDescriptor(window, "PointerEvent") ?? {};
  Object.defineProperty(window, "PointerEvent", {
    value: MouseEvent,
    configurable: true,
  });

  expect(fireClickEvent(element)).toBe(true);
  expect(dispatchEventSpy).toHaveBeenCalledWith(event);

  dispatchEventSpy.mockRestore();
  Object.defineProperty(window, "PointerEvent", originalPointerEvent);
});

test("isFocusEventOutside", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="parent">
      <div id="child" />
    </div>
    <div id="portal" />
  `;
  const parent = document.getElementById("parent");
  const child = document.getElementById("child");
  const portal = document.getElementById("portal");

  const fakeEvent = {
    currentTarget: parent,
    relatedTarget: child,
  } as any;
  expect(isFocusEventOutside(fakeEvent)).toBe(false);
  expect(isFocusEventOutside(fakeEvent, child)).toBe(false);
  expect(isFocusEventOutside(fakeEvent, parent)).toBe(false);

  const fakeEvent2 = {
    currentTarget: portal,
    relatedTarget: parent,
  } as any;
  expect(isFocusEventOutside(fakeEvent2)).toBe(true);
  expect(isFocusEventOutside(fakeEvent2, child)).toBe(true);
  expect(isFocusEventOutside(fakeEvent2, portal)).toBe(true);

  document.body.innerHTML = initialInnerHTML;
});

test("queueBeforeEvent", () => {
  const rafSpy = jest
    .spyOn(window, "requestAnimationFrame")
    .mockImplementation((cb) => {
      setTimeout(() => cb(0));
      return 0;
    });

  const element = document.createElement("div");
  const callback = jest.fn();

  const raf = queueBeforeEvent(element, "keyup", callback);
  expect(raf).toBe(0);
  expect(callback).toHaveBeenCalledTimes(0);
  element.dispatchEvent(new KeyboardEvent("keyup"));
  expect(callback).toHaveBeenCalledTimes(1);
  jest.useFakeTimers();
  queueBeforeEvent(element, "keyup", callback);
  // Advance time enough to make sure the settimout has fired
  jest.advanceTimersByTime(1000);
  expect(callback).toHaveBeenCalledTimes(2);

  rafSpy.mockRestore();
  jest.useRealTimers();
});

test("addGlobalEventListener", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <iframe id="iframe" />
  `;
  const callback = jest.fn();
  const addEventListenerSpy = jest.spyOn(window.document, "addEventListener");
  const removeEventListenerSpy = jest.spyOn(
    window.document,
    "removeEventListener"
  );

  const remove = addGlobalEventListener("keyup", callback, undefined);
  expect(addEventListenerSpy).toHaveBeenCalledWith(
    "keyup",
    callback,
    undefined
  );
  expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
  remove();
  expect(removeEventListenerSpy).toHaveBeenCalledWith(
    "keyup",
    callback,
    undefined
  );
  expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);

  document.body.innerHTML = initialInnerHTML;
  addEventListenerSpy.mockReset();
  removeEventListenerSpy.mockReset();

  // This tests when one of the frames comes back as undefined
  //  Specifically the `if (frameWindow) {` check
  const originalFrames =
    Object.getOwnPropertyDescriptor(window, "frames") ?? {};
  Object.defineProperty(window, "frames", {
    value: [undefined],
    configurable: true,
  });

  const remove2 = addGlobalEventListener("keyup", callback, undefined);
  expect(addEventListenerSpy).toHaveBeenCalledWith(
    "keyup",
    callback,
    undefined
  );
  remove2();
  expect(removeEventListenerSpy).toHaveBeenCalledWith(
    "keyup",
    callback,
    undefined
  );

  Object.defineProperty(window, "frames", originalFrames);
});
