export * from "@ariakit/store";
export * from "./store.tsx";
// `Store` is exported by both `@ariakit/store` (the core interface) and
// `./store.tsx` (the Solid wrapper `T & { useState }`). Re-export the Solid
// wrapper explicitly so it shadows the core one, mirroring how
// `@ariakit/react-store` surfaces its own `Store` wrapper.
export type { Store } from "./store.tsx";
