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
/// <reference types="@clerk/astro/env" />

declare module "cloudflare:workers" {
  const env: Cloudflare.Env;
  export { env };
}

declare module "@fontsource-variable/inter";

declare module "*?source" {
  const source: import("./src/lib/source.ts").Source;
  export default source;
}

declare module "#app/styles/styles.json" {
  const styles: import("./src/lib/styles.ts").StylesJson;
  export default styles;
}

type PlusType = import("./src/lib/schemas.ts").PlusType;
type Framework = import("./src/lib/schemas.ts").Framework;
type User = import("@clerk/astro/server").User;

declare namespace App {
  interface Locals {
    user?: User | null;
    framework?: Framework;
    reference?: string;
  }
  interface SessionData {
    admin: {
      limit?: number;
    };
  }
}

declare interface UserPublicMetadata {
  plus?: PlusType | null;
}

declare interface UserPrivateMetadata {
  stripeId?: string;
  credit?: number | null;
  currency?: string | null;
}

declare interface CustomJwtSessionClaims {
  publicMetadata: UserPublicMetadata;
  teams: Record<string, string>;
}

declare interface ImportMetaEnv {
  readonly PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  readonly CLERK_SECRET_KEY?: string;
  readonly CLERK_WEBHOOK_SECRET?: string;
  readonly CLERK_APP_ID?: string;
  readonly PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  readonly STRIPE_SECRET_KEY?: string;
  readonly STRIPE_WEBHOOK_SECRET?: string;
  readonly ADMIN_ORG_ID?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
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
