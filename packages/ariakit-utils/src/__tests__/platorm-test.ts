import {
  isApple,
  isFirefox,
  isMac,
  isSafari,
  isTouchDevice,
} from "../platform";

function navigatorProperty<T extends keyof Navigator>(propertyName: T) {
  const originalDescriptor =
    Object.getOwnPropertyDescriptor(navigator, propertyName) ?? {};
  return {
    set: (value: Navigator[T]) =>
      Object.defineProperty(navigator, propertyName, { value, writable: true }),
    reset: () =>
      Object.defineProperty(navigator, propertyName, originalDescriptor),
  };
}

test("isTouchDevice", () => {
  const maxTouchPoints = navigatorProperty("maxTouchPoints");

  // Fake touch device
  maxTouchPoints.set(1);
  expect(isTouchDevice()).toBe(true);

  // Fake non-touch device
  maxTouchPoints.set(0);
  expect(isTouchDevice()).toBe(false);

  maxTouchPoints.reset();
});

test("isApple", () => {
  const platform = navigatorProperty("platform");

  // Fake Apple device
  platform.set("Macintosh");
  expect(isApple()).toBe(true);
  platform.set("iPhone");
  expect(isApple()).toBe(true);
  platform.set("iPad");
  expect(isApple()).toBe(true);
  platform.set("iPod");
  expect(isApple()).toBe(true);

  // Fake non-Apple device
  platform.set("Something Else");
  expect(isApple()).toBe(false);

  platform.reset();
});

test("isSafari", () => {
  const platform = navigatorProperty("platform");
  const vendor = navigatorProperty("vendor");

  // Fake Safari browser
  platform.set("Macintosh");

  vendor.set("Apple Computer, Inc.");
  expect(isSafari()).toBe(true);

  // Fake Chrome browser
  vendor.set("Google Inc.");
  expect(isSafari()).toBe(false);

  platform.reset();
  vendor.reset();
});

test("isFirefox", () => {
  const userAgent = navigatorProperty("userAgent");

  // Fake Firefox browser
  userAgent.set(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:77.0) Gecko/20100101 Firefox/77.0"
  );
  expect(isFirefox()).toBe(true);

  // Fake Chrome browser
  userAgent.set(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:77.0) Gecko/20100101 Chrome/77.0"
  );
  expect(isFirefox()).toBe(false);

  userAgent.reset();
});

test("isMac", () => {
  const platform = navigatorProperty("platform");

  // Fake Mac computer
  platform.set("Macintosh");
  expect(isMac()).toBe(true);

  // Fake Windows computer
  platform.set("Win32");
  expect(isMac()).toBe(false);

  platform.reset();
});
