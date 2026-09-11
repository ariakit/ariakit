/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
/// <reference types="astro/client" />

declare module "@fontsource-variable/inter";

declare module "*?source" {
  const source: import("./src/lib/source.ts").Source;
  export default source;
}

type Framework = import("./src/lib/schemas.ts").Framework;

declare namespace App {
  interface Locals {
    framework?: Framework;
    /** The `preview.json` route that `[...preview].astro` is rendering. */
    previewRoute?: string;
    reference?: string;
  }
}

declare interface ImportMetaEnv {
  readonly STRIPE_SECRET_KEY?: string;
  readonly STRIPE_WEBHOOK_SECRET?: string;
  readonly NEXTJS_PORT?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace Cloudflare {
  interface Env extends ImportMetaEnv {}
}

declare namespace astroHTML.JSX {
  interface ButtonHTMLAttributes {
    command?:
      | "show-modal"
      | "close"
      | "request-close"
      | "show-popover"
      | "hide-popover"
      | "toggle-popover"
      | `--${string}`;
    commandfor?: string;
  }
}
