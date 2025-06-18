export function onIdle(callback: () => void, timeout = 1) {
  if (typeof requestIdleCallback !== "undefined") {
    const handle = requestIdleCallback(callback, { timeout });
    return () => cancelIdleCallback(handle);
  }
  const handle = setTimeout(callback, Math.min(timeout, 1000));
  return () => clearTimeout(handle);
}
