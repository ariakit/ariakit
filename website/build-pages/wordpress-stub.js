// Stub module replacing @wordpress/components and @wordpress/element so the
// menu-wordpress-modal example does not break the Next.js build under
// React 19. The example is excluded from runtime preview render (see
// ignoredExampleIds in components/preview.tsx) so the stubs are never invoked.
const noop = () => null;
export const SlotFillProvider = noop;
export const createSlotFill = () => ({ Fill: noop, Slot: noop });
export const Modal = noop;
export const createElement = noop;
export const Fragment = noop;
export default noop;
