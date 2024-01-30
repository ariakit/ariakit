"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties } from "react";
import { scrollIntoViewIfNeeded } from "@ariakit/core/utils/dom";
import { createStore, sync } from "@ariakit/core/utils/store";
import {
  Button,
  Heading,
  HeadingLevel,
  Hovercard,
  HovercardAnchor,
  HovercardProvider,
  Role,
  VisuallyHidden,
} from "@ariakit/react";
import type {
  ButtonProps,
  HovercardAnchorProps,
  HovercardProps,
  HovercardProviderProps,
  RoleProps,
} from "@ariakit/react";
import { useStore, useStoreProps } from "@ariakit/react-core/utils/store";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure.js";
import { formatDistanceToNow } from "date-fns";
import { Check } from "icons/check.jsx";
import { ChevronRight } from "icons/chevron-right.jsx";
import { Heart } from "icons/heart.jsx";
import { twJoin, twMerge } from "tailwind-merge";
import type { PlusPrice } from "utils/stripe.js";
import { useMedia } from "utils/use-media.js";
import { useSubscription } from "utils/use-subscription.js";
import { Command } from "./command.jsx";

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
  clientSecret?: string;
  setClientSecret?: (secret: string) => void;
  priceId?: string;
  setPriceId?: (priceId: string) => void;
}

function usePlusStore(props: PlusStoreProps) {
  const isMedium = useMedia("(min-width: 768px)", true);

  const [store] = useStore(createStore, {
    feature: props.feature ?? props.defaultFeature ?? "",
    clientSecret: props.clientSecret ?? "",
    priceId: props.priceId ?? "",
  });

  useStoreProps(store, props, "feature", "setFeature");
  useStoreProps(store, props, "clientSecret", "setClientSecret");
  useStoreProps(store, props, "priceId", "setPriceId");

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
  const isOpen = store.useState((state) => !!state.feature && !state.priceId);
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
    const isActive = store.useState(
      (state) => !state.priceId && state.feature === feature,
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
          "group relative flex gap-2 rounded-md p-2 data-[active]:bg-black/5 dark:data-[active]:bg-white/5",
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
        <ChevronRight className="ml-auto hidden h-4 w-4 flex-none translate-y-1 opacity-60 group-data-[active]:block" />
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
  const isActive = store.useState(
    (state) => !state.priceId && state.feature === feature,
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
  const store = useContext(PlusContext)!;
  const clientSecret = store.useState("clientSecret");
  const selected = store.useState(
    (state) => !!state.priceId && state.priceId === price?.id,
  );

  const previousFeatureRef = useRef("");
  const subscription = useSubscription();

  if (!price || subscription.isLoading) {
    return (
      <div className="h-[162px] animate-pulse rounded-lg border-2 border-transparent bg-black/5 dark:bg-white/5" />
    );
  }

  const purchased = subscription.data === price.id;

  if (purchased) {
    return (
      <div className="flex h-[162px] flex-col items-center justify-center gap-4 rounded-lg bg-black/5 text-emerald-800 dark:bg-white/5 dark:text-emerald-400">
        <div className="rounded-full border-[3px] border-current p-2">
          <Check className="size-10" />
        </div>
        <div className="text-xl">Purchased</div>
      </div>
    );
  }

  return (
    <form
      action="/api/customer-portal"
      method="post"
      target="_blank"
      onSubmit={async (event) => {
        event.preventDefault();
        if (selected) {
          store.setState("priceId", "");
          store.setState("feature", previousFeatureRef.current || "examples");
          store.setState("clientSecret", "");
          return;
        }
        previousFeatureRef.current = store.getState().feature;
        store.setState("priceId", price.id);
        store.setState("feature", "");
        store.setState("clientSecret", "");
        const res = await fetch("/api/checkout", {
          method: "post",
          body: JSON.stringify({ priceId: price.id }),
        });
        const clientSecret = await res.json();
        if (!clientSecret) return;
        const state = store.getState();
        if (state.priceId !== price.id) return;
        store.setState("clientSecret", clientSecret);
      }}
    >
      <div className="relative flex flex-col items-center gap-4 rounded-xl bg-black/5 p-4 pt-8 dark:bg-white/5">
        {price.expiresAt && (
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
          {price.percentOff && (
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
        <Button
          ref={ref}
          type="submit"
          name="priceId"
          value={price.id}
          disabled={selected && !clientSecret}
          className={twJoin(
            "h-14 w-full text-lg font-medium",
            selected && "bg-black/5 dark:bg-white/5",
          )}
          {...props}
          render={
            <Command
              flat={selected}
              variant={selected ? "secondary" : "primary"}
              render={props.render}
            />
          }
        >
          {selected ? "Cancel" : "Buy now"}
        </Button>
      </div>
    </form>
  );
});

export interface PlusCheckoutFrameProps extends RoleProps<"div"> {}

export function PlusCheckoutFrame(props: PlusCheckoutFrameProps) {
  const store = useContext(PlusContext)!;
  const hasPriceId = store.useState((state) => !!state.priceId);
  const clientSecret = store.useState("clientSecret");

  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);
  const [visibility, setVisibility] =
    useState<CSSProperties["visibility"]>("hidden");

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

  const stripePromise = getStripe();

  if (!stripePromise) return null;
  if (!hasPriceId) return null;

  return (
    <Role.div
      {...props}
      className={twMerge(
        "relative",
        visibility === "hidden" && "h-full",
        props.className,
      )}
    >
      {visibility === "hidden" && (
        <div className="h-full w-full animate-pulse bg-gray-100 dark:bg-black/20" />
      )}
      {clientSecret && (
        <div ref={setWrapper} style={{ visibility }} key={clientSecret}>
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}
    </Role.div>
  );
}
