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

type PlusType = import("./lib/schemas.ts").PlusType;
type Framework = import("./lib/schemas.ts").Framework;
type User = import("@clerk/astro/server").User;
type KVNamespace = import("@cloudflare/workers-types").KVNamespace;

type Runtime = import("@astrojs/cloudflare").Runtime<{
  PLUS: KVNamespace;
  EVENTS: KVNamespace;
  ADMIN: KVNamespace;
}>;

declare namespace App {
  interface Locals extends Runtime {
    user?: User | null;
    framework?: Framework;
    example?: string;
  }
  interface SessionData {
    admin: {
      limit?: number;
    };
  }
}

interface UserPublicMetadata {
  plus?: PlusType | null;
}

interface UserPrivateMetadata {
  stripeId?: string;
  credit?: number | null;
  currency?: string | null;
}

interface CustomJwtSessionClaims {
  publicMetadata: UserPublicMetadata;
  teams: Record<string, string>;
}

interface ImportMetaEnv {
  readonly PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  readonly CLERK_SECRET_KEY?: string;
  readonly CLERK_WEBHOOK_SECRET?: string;
  readonly CLERK_APP_ID?: string;
  readonly PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  readonly STRIPE_SECRET_KEY?: string;
  readonly STRIPE_WEBHOOK_SECRET?: string;
  readonly ADMIN_ORG_ID?: string;
}

interface ImportMeta {
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
