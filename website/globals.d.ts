import type { Clerk } from "@clerk/nextjs/types";

declare global {
  interface Window {
    Clerk?: Clerk;
  }
}
