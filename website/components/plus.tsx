"use client";
import { scrollIntoViewIfNeeded } from "@ariakit/core/utils/dom";
import { createStore, sync } from "@ariakit/core/utils/store";
import type {
  ButtonProps,
  HovercardAnchorProps,
  HovercardProps,
  HovercardProviderProps,
  RoleProps,
} from "@ariakit/react";
import {
  Heading,
  HeadingLevel,
  Hovercard,
  HovercardAnchor,
  HovercardProvider,
  Role,
  VisuallyHidden,
} from "@ariakit/react";
import { useEvent } from "@ariakit/react-core/utils/hooks";
import { useStore, useStoreProps } from "@ariakit/react-core/utils/store";
import { SignedIn, SignedOut, SignUp } from "@clerk/clerk-react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link.js";
import { useRouter, useSearchParams } from "next/navigation.js";
import type { CSSProperties } from "react";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useState,
} from "react";
import { twJoin, twMerge } from "tailwind-merge";
import { Check } from "@/icons/check.tsx";
import { CheckCircle } from "@/icons/check-circle.tsx";
import { ChevronRight } from "@/icons/chevron-right.tsx";
import { Heart } from "@/icons/heart.tsx";
import type { PlusPrice } from "@/lib/stripe.ts";
import { useMedia } from "@/lib/use-media.ts";
import { useSubscription } from "@/lib/use-subscription.ts";
import { Command } from "./command.tsx";
import { useRootPathname } from "./root-pathname.tsx";

let stripePromise: ReturnType<typeof loadStripe> | null = null;

const getStripe = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) return null;
  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

const PlusContext = createContext<ReturnType<typeof usePlusStore> | null>(null);

interface PlusStoreProps {
  feature?: string;
  defaultFeature?: string;
  setFeature?: (feature: string) => void;
}

function usePlusStore(props: PlusStoreProps) {
  const isMedium = useMedia("(min-width: 768px)", true);

  const [store] = useStore(createStore, {
    feature: props.feature ?? props.defaultFeature ?? "",
  });

  useStoreProps(store, props, "feature", "setFeature");

  useEffect(() => {
    if (isMedium) return;
    return sync(store, ["feature"], () => {
      store.setState("feature", "");
    });
  }, [isMedium, store]);

  return store;
}

export interface PlusProviderProps
  extends PlusStoreProps,
    HovercardProviderProps {}

export function PlusProvider(props: PlusProviderProps) {
  const store = usePlusStore(props);
  const searchParams = useSearchParams();
  const priceId = searchParams.get("checkout");
  const isOpen = store.useState((state) => !priceId && !!state.feature);
  return (
    <PlusContext.Provider value={store}>
      <HovercardProvider open={isOpen} {...props} />
    </PlusContext.Provider>
  );
}

export interface PlusFeatureProps extends HovercardAnchorProps<"div"> {
  feature: string;
  icon?: "heart" | "check";
}

export const PlusFeature = forwardRef<HTMLDivElement, PlusFeatureProps>(
  function PlusFeature({ icon = "check", feature, ...props }, ref) {
    const store = useContext(PlusContext)!;
    const searchParams = useSearchParams();
    const priceId = searchParams.get("checkout");
    const isActive = store.useState(
      (state) => !priceId && state.feature === feature,
    );

    const showOnHover = () => {
      store.setState("feature", feature);
      return true;
    };

    return (
      <Role.div
        ref={ref}
        {...props}
        data-active={isActive || undefined}
        className={twMerge(
          "group relative flex gap-2 rounded-md p-2",
          "before:absolute before:inset-4 before:rounded-[inherit] before:transition-[background-color,inset] data-[active]:before:inset-0 data-[active]:before:bg-black/5 dark:data-[active]:before:bg-white/5",
          props.className,
        )}
        render={
          <HovercardAnchor
            onFocusVisible={showOnHover}
            showOnHover={showOnHover}
            render={<Role.div render={props.render} />}
          />
        }
      >
        {icon === "check" ? (
          <Check
            strokeWidth={3}
            className="h-4 w-4 flex-none translate-y-1 stroke-green-700 dark:stroke-green-300"
          />
        ) : icon === "heart" ? (
          <Heart className="h-4 w-4 flex-none translate-y-1 fill-pink-600 dark:fill-pink-500" />
        ) : null}
        <p>{props.children}</p>
        <ChevronRight className="ml-auto h-4 w-4 flex-none translate-y-1 opacity-0 transition-opacity group-data-[active]:opacity-60" />
      </Role.div>
    );
  },
);

export interface PlusFeaturePreviewContainerProps extends HovercardProps {}

export const PlusFeaturePreviewContainer = forwardRef<
  HTMLDivElement,
  PlusFeaturePreviewContainerProps
>(function PlusFeaturePreviewContainer(props, ref) {
  return (
    <Hovercard
      ref={ref}
      role="presentation"
      disablePointerEventsOnApproach
      unmountOnHide
      focusable={false}
      hideOnEscape={false}
      hideOnHoverOutside={false}
      hideOnInteractOutside={false}
      updatePosition={() => {}}
      {...props}
      render={<Role.div id={undefined} render={props.render} />}
      getPersistentElements={() => document.getElementsByTagName("body")}
      wrapperProps={{
        ...props.wrapperProps,
        style: {
          position: "relative",
          width: "100%",
          ...props.wrapperProps?.style,
        },
      }}
    />
  );
});

export interface PlusFeaturePreviewProps extends RoleProps<"div"> {
  feature: string;
  heading?: React.ReactNode;
}

export const PlusFeaturePreview = forwardRef<
  HTMLDivElement,
  PlusFeaturePreviewProps
>(function PlusFeaturePreview({ feature, heading, children, ...props }, ref) {
  const store = useContext(PlusContext)!;
  const searchParams = useSearchParams();
  const priceId = searchParams.get("checkout");
  const isActive = store.useState(
    (state) => !priceId && state.feature === feature,
  );
  if (!isActive) return null;
  return (
    <div
      ref={ref}
      {...props}
      className={twMerge("flex flex-col gap-6", props.className)}
    >
      {heading ? (
        <HeadingLevel>
          <Heading className="text-2xl font-medium">{heading}</Heading>
          {children}
        </HeadingLevel>
      ) : (
        children
      )}
    </div>
  );
});

export interface PlusCheckoutButtonProps extends ButtonProps {
  price?: PlusPrice;
}

export const PlusCheckoutButton = forwardRef<
  HTMLButtonElement,
  PlusCheckoutButtonProps
>(function PlusCheckoutButton({ price, ...props }, ref) {
  const subscription = useSubscription();
  const searchParams = useSearchParams();
  const priceId = searchParams.get("checkout");
  const selected = !!priceId && priceId === price?.id;

  if (!price || subscription.isLoading) {
    return (
      <div className="h-[162px] animate-pulse rounded-lg border-2 border-transparent bg-black/5 dark:bg-white/5" />
    );
  }

  const purchased =
    !!subscription.data &&
    !subscription.data.recurring &&
    subscription.data.product === price.product;

  if (purchased) {
    return (
      <div className="flex h-[162px] flex-col items-center justify-center gap-2 rounded-lg bg-black/5 dark:bg-white/5">
        <CheckCircle className="size-16 stroke-1 text-emerald-800 dark:text-emerald-300" />
        <div className="text-xl">Purchased</div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center gap-4 rounded-xl bg-black/5 p-4 pt-8 dark:bg-white/5">
      {!!price.expiresAt && (
        <div className="-mt-11 flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1 text-[13px] leading-[18px] text-black/80 dark:border-white/10 dark:bg-gray-700 dark:text-white/80">
          <div className="-ml-1.5 size-2 flex-none animate-pulse rounded-full bg-yellow-800 dark:bg-amber-400" />
          <span className="line-clamp-1">
            Promotion ends on{" "}
            {new Date(price.expiresAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            ({formatDistanceToNow(price.expiresAt)} left)
          </span>
        </div>
      )}
      <div className="flex items-center gap-4 px-6">
        <div className="relative flex items-center text-[42px] font-semibold leading-[42px] tracking-wide">
          <span className="absolute -left-6 top-0.5 text-base font-normal opacity-60">
            US
          </span>
          <span className="text-[36px] font-extralight">$</span>
          {Math.ceil(price.amount / 100)}
        </div>
        {!!price.percentOff && (
          <div className="text-sm text-black/80 dark:text-white/80">
            <del className="tracking-wider opacity-70">
              <VisuallyHidden>Original price: </VisuallyHidden>$
              {Math.ceil(price.originalAmount / 100)}
            </del>
            <div className="font-semibold text-yellow-800 dark:text-amber-400">
              Save {price.percentOff}%
            </div>
          </div>
        )}
      </div>
      <Command
        ref={ref}
        flat={selected}
        variant={selected ? "secondary" : "primary"}
        {...props}
        className={twJoin(
          "h-14 w-full text-lg font-medium focus-visible:!ariakit-outline",
          selected && "bg-black/5 dark:bg-white/5",
        )}
        render={
          <Link
            href={selected ? "/plus" : `/plus?checkout=${price.id}`}
            scroll={false}
            replace
          />
        }
      >
        {selected ? "Cancel" : "Buy now"}
      </Command>
    </div>
  );
});

export interface PlusCheckoutFrameProps extends RoleProps<"div"> {}

interface Session {
  id: string | null;
  clientSecret: string | null;
}

export function PlusCheckoutFrame(props: PlusCheckoutFrameProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const rootPathname = useRootPathname();
  const searchParams = useSearchParams();
  const priceId = searchParams.get("checkout");
  const subscription = useSubscription();
  const [session, setSession] = useState<Session | null>(null);
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);
  const [visibility, setVisibility] =
    useState<CSSProperties["visibility"]>("hidden");

  const redirectUrl = `${rootPathname}?checkout=${priceId}`;
  const userId = subscription.userId;

  useEffect(() => {
    if (!userId) return;
    if (!priceId) return;

    const controller = new AbortController();
    const onAbort = () => {
      setSession(null);
    };
    controller.signal.addEventListener("abort", onAbort);

    const processClientSecret = async () => {
      const signal = controller.signal;
      const response = await fetch("/api/checkout", {
        method: "post",
        body: JSON.stringify({ priceId, redirectUrl }),
        signal,
      });
      if (!response.ok) {
        setSession(null);
        return;
      }
      if (signal.aborted) return;
      const session = (await response.json()) as {
        id: string | null;
        clientSecret: string | null;
      };
      if (signal.aborted) return;
      if (!session.clientSecret) {
        setSession(null);
        const url = new URL(location.href);
        url.searchParams.delete("checkout");
        router.replace(url.toString(), { scroll: false });
        return;
      }
      setSession(session);
    };

    processClientSecret();
    return () => {
      try {
        controller.abort();
      } catch {}
      controller.signal.removeEventListener("abort", onAbort);
    };
  }, [userId, priceId, redirectUrl]);

  useEffect(() => {
    if (!wrapper) return;

    let iframe = wrapper.querySelector<HTMLIFrameElement>("iframe");

    const onLoad = () => {
      setVisibility("visible");
      if (iframe) {
        scrollIntoViewIfNeeded(iframe, {
          block: "nearest",
          behavior: "smooth",
        });
      }
    };

    const observer = new MutationObserver(() => {
      iframe?.removeEventListener("load", onLoad);
      iframe = wrapper.querySelector<HTMLIFrameElement>("iframe");
      if (!iframe) return;
      iframe.addEventListener("load", onLoad);
      observer.disconnect();
    });
    observer.observe(wrapper, { childList: true, subtree: true });

    return () => {
      setVisibility("hidden");
      observer.disconnect();
      iframe?.removeEventListener("load", onLoad);
    };
  }, [wrapper]);

  const onCheckoutComplete = useEvent(async () => {
    queryClient.invalidateQueries({ queryKey: ["subscription"] });
    if (!session?.id) return;
    await fetch(`/api/checkout-success?session_id=${session.id}`);
  });

  const stripePromise = getStripe();

  if (!stripePromise) return null;
  if (!priceId) return null;

  return (
    <Role.div
      {...props}
      className={twMerge(
        "relative",
        visibility === "hidden" && "h-full",
        props.className,
      )}
    >
      <SignedOut>
        <SignUp
          routing="virtual"
          redirectUrl={redirectUrl}
          signInUrl={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
          appearance={{ layout: { showOptionalFields: false } }}
        />
      </SignedOut>
      <SignedIn>
        {visibility === "hidden" && (
          <div className="h-full w-full animate-pulse bg-gray-100 dark:bg-black/20" />
        )}
        {session?.clientSecret && (
          <div
            ref={setWrapper}
            style={{ visibility }}
            key={session.clientSecret}
          >
            <EmbeddedCheckoutProvider
              key={session.clientSecret}
              stripe={stripePromise}
              options={{
                clientSecret: session.clientSecret,
                onComplete: onCheckoutComplete,
              }}
            >
              <EmbeddedCheckout key={session.clientSecret} />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </SignedIn>
    </Role.div>
  );
}
