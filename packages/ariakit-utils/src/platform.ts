import { canUseDOM } from "./dom";

/**
 * Detects if the device has touch capabilities.
 */
export function isTouchDevice() {
  return canUseDOM && !!navigator.maxTouchPoints;
}

/**
 * Detects Apple device.
 */
export function isApple() {
  if (!canUseDOM) return false;
  return /mac|iphone|ipad|ipod/i.test(navigator.platform);
}

/**
 * Detects Safari browser.
 */
export function isSafari() {
  return canUseDOM && isApple() && /apple/i.test(navigator.vendor);
}

/**
 * Detects Firefox browser.
 */
export function isFirefox() {
  return canUseDOM && /firefox\//i.test(navigator.userAgent);
}

/**
 * Detects Mac computer.
 */
export function isMac() {
  return canUseDOM && navigator.platform.startsWith("Mac") && !isTouchDevice();
}
