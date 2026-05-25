import type { Clerk } from "@clerk/shared/types";

declare global {
  interface Window {
    Clerk?: Clerk;
  }
}
