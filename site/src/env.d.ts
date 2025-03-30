/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    framework?: import("./lib/types.ts").Framework;
    example?: string;
  }
}
