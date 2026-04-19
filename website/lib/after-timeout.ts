export function afterTimeout(timeout: number, callback: () => void) {
  const id = setTimeout(callback, timeout);
  return () => clearTimeout(id);
}
