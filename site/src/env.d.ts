/// <reference types="astro/client" />
/// <reference types="@clerk/astro/env" />

type Runtime = import("@astrojs/cloudflare").Runtime<{
  PLUS: import("@cloudflare/workers-types").KVNamespace;
  EVENTS: import("@cloudflare/workers-types").KVNamespace;
}>;

declare namespace App {
  interface Locals extends Runtime {
    user?: import("@clerk/astro/server").User | null;
    products?: Record<
      import("./lib/schemas.ts").PlusType,
      import("stripe").Stripe.Product | null
    >;
    framework?: import("./lib/schemas.ts").Framework;
    example?: string;
  }
}

declare module "stripe" {
  declare namespace Stripe {
    interface Customer {
      metadata: {
        clerkId?: string;
      };
    }
    interface Product {
      metadata: {
        plusType?: import("./lib/schemas.ts").PlusType;
      };
    }
    interface PaymentIntent {
      metadata: {
        price?: string;
        product?: string;
      };
    }
  }
}

interface UserPrivateMetadata {
  stripeId?: string;
  plus?: import("./lib/schemas.ts").PlusType | null;
  credit?: number | null;
  currency?: string | null;
}

interface ImportMetaEnv {
  readonly PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  readonly CLERK_SECRET_KEY?: string;
  readonly CLERK_WEBHOOK_SECRET?: string;
  readonly PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  readonly STRIPE_SECRET_KEY?: string;
  readonly STRIPE_WEBHOOK_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
