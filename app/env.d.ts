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

declare module "@fontsource-variable/inter";

declare module "*?source" {
  const source: import("./src/lib/source.ts").Source;
  export default source;
}

declare module "#app/styles/styles.json" {
  const styles: import("./src/lib/styles-json-types.ts").StylesJson;
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

interface KVNamespace {
  get(key: string): Promise<string | null>;
  getWithMetadata<Metadata>(
    key: string,
  ): Promise<{ metadata: Metadata | null }>;
  getWithMetadata<Metadata>(
    keys: string[],
  ): Promise<Map<string, { metadata: Metadata | null } | null>>;
  list<Metadata>(options?: { prefix?: string }): Promise<{
    keys: Array<{ metadata?: Metadata | undefined }>;
  }>;
  put(
    key: string,
    value: string,
    options?: { metadata?: unknown },
  ): Promise<void>;
  delete(key: string): Promise<void>;
}

declare namespace Cloudflare {
  interface Env {
    readonly PLUS: KVNamespace;
    readonly EVENTS: KVNamespace;
    readonly ADMIN: KVNamespace;
    readonly NEXTJS_PORT?: string;
  }
}

declare module "cloudflare:workers" {
  export const env: Cloudflare.Env;
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
