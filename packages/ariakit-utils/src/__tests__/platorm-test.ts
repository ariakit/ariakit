import {
  isApple,
  isFirefox,
  isMac,
  isSafari,
  isTouchDevice,
} from "../platform";

const getNavigatorPropertyDescriptor = (propertyName: string) =>
  Object.getOwnPropertyDescriptor(navigator, propertyName) ?? {};
const setNavigatorProperty = (propertyName: string, value: any) =>
  Object.defineProperty(navigator, propertyName, {
    value,
    writable: true,
  });
const resetNavigatorProperty = (propertyName: string, descriptor: any) =>
  Object.defineProperty(navigator, propertyName, descriptor);

test("isTouchDevice", () => {
  // Fake touch device
  const originalNavigatorMaxTouchPoints =
    getNavigatorPropertyDescriptor("maxTouchPoints");
  setNavigatorProperty("maxTouchPoints", true);
  expect(isTouchDevice()).toBe(true);

  // Fake non-touch device
  setNavigatorProperty("maxTouchPoints", false);
  expect(isTouchDevice()).toBe(false);

  resetNavigatorProperty("maxTouchPoints", originalNavigatorMaxTouchPoints);
});

test("isApple", () => {
  // Fake Apple device
  const originalNavigatorPlatform = getNavigatorPropertyDescriptor("platform");
  setNavigatorProperty("platform", "Macintosh");
  expect(isApple()).toBe(true);
  setNavigatorProperty("platform", "iPhone");
  expect(isApple()).toBe(true);
  setNavigatorProperty("platform", "iPad");
  expect(isApple()).toBe(true);
  setNavigatorProperty("platform", "iPod");
  expect(isApple()).toBe(true);

  // Fake non-Apple device
  setNavigatorProperty("platform", "Something Else");
  expect(isApple()).toBe(false);

  resetNavigatorProperty("platform", originalNavigatorPlatform);
});

test("isSafari", () => {
  // Fake Safari browser
  const originalNavigatorPlatform = getNavigatorPropertyDescriptor("platform");
  setNavigatorProperty("platform", "Macintosh");

  const originalNavigatorVendor = getNavigatorPropertyDescriptor("vendor");
  setNavigatorProperty("vendor", "Apple Computer, Inc.");
  expect(isSafari()).toBe(true);

  // Fake Chrome browser
  setNavigatorProperty("vendor", "Google Inc.");
  expect(isSafari()).toBe(false);

  resetNavigatorProperty("platform", originalNavigatorPlatform);
  resetNavigatorProperty("vendor", originalNavigatorVendor);
});

test("isFirefox", () => {
  // Fake Firefox browser
  const originalNavigatorUserAgent =
    getNavigatorPropertyDescriptor("userAgent");
  setNavigatorProperty(
    "userAgent",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:77.0) Gecko/20100101 Firefox/77.0"
  );
  expect(isFirefox()).toBe(true);

  // Fake Chrome browser
  setNavigatorProperty(
    "userAgent",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:77.0) Gecko/20100101 Chrome/77.0"
  );
  expect(isFirefox()).toBe(false);

  resetNavigatorProperty("userAgent", originalNavigatorUserAgent);
});

test("isMac", () => {
  // Fake Mac computer
  const originalNavigatorPlatform = getNavigatorPropertyDescriptor("platform");
  setNavigatorProperty("platform", "Macintosh");
  expect(isMac()).toBe(true);

  // Fake Windows computer
  setNavigatorProperty("platform", "Win32");
  expect(isMac()).toBe(false);

  resetNavigatorProperty("platform", originalNavigatorPlatform);
});
