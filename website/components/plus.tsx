"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useState,
} from "react";
import type { CSSProperties } from "react";
import { createStore } from "@ariakit/core/utils/store";
import {
  Button,
  Heading,
  HeadingLevel,
  Hovercard,
  HovercardAnchor,
  HovercardProvider,
  Role,
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
import { loadStripe } from "@stripe/stripe-js";
import { Check } from "icons/check.jsx";
import { ChevronRight } from "icons/chevron-right.jsx";
import { Heart } from "icons/heart.jsx";
import { twMerge } from "tailwind-merge";
import invariant from "tiny-invariant";
import type { Price } from "utils/stripe.js";
import { useSubscription } from "utils/use-subscription.js";
import { Command } from "./command.jsx";

const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = key ? loadStripe(key) : null;

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
  const [store] = useStore(createStore, {
    feature: props.feature ?? props.defaultFeature ?? "",
    clientSecret: props.clientSecret ?? "",
    priceId: props.priceId ?? "",
  });

  useStoreProps(store, props, "feature", "setFeature");
  useStoreProps(store, props, "clientSecret", "setClientSecret");
  useStoreProps(store, props, "priceId", "setPriceId");

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
  children?: React.ReactNode;
}

export const PlusFeature = forwardRef<HTMLDivElement, PlusFeatureProps>(
  function PlusFeature({ icon = "check", feature, ...props }, ref) {
    const store = useContext(PlusContext);
    invariant(store);

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
  children?: React.ReactNode;
}

export const PlusFeaturePreview = forwardRef<
  HTMLDivElement,
  PlusFeaturePreviewProps
>(function PlusFeaturePreview({ feature, heading, children, ...props }, ref) {
  const store = useContext(PlusContext);
  invariant(store);
  const isActive = store.useState(
    (state) => !state.priceId && state.feature === feature,
  );
  if (!isActive) return null;
  return (
    <div
      ref={ref}
      {...props}
      className={twMerge("flex flex-col gap-4", props.className)}
    >
      {heading ? (
        <HeadingLevel>
          <Heading className="text-2xl font-semibold">{heading}</Heading>
          {children}
        </HeadingLevel>
      ) : (
        children
      )}
    </div>
  );
});

export interface PlusCheckoutButtonProps extends ButtonProps {
  price?: Price;
  monthlyPrice?: Price;
}

export const PlusCheckoutButton = forwardRef<
  HTMLButtonElement,
  PlusCheckoutButtonProps
>(function PlusCheckoutButton({ price, monthlyPrice, ...props }, ref) {
  const store = useContext(PlusContext);
  invariant(store);

  const selected = store.useState(
    (state) => !!state.priceId && state.priceId === price?.id,
  );

  const subscription = useSubscription();

  if (!price || subscription.isLoading) {
    return (
      <div className="h-24 animate-pulse rounded-lg border-2 border-transparent bg-black/5 dark:bg-white/5" />
    );
  }

  const isCurrentSubscription = subscription.data === price?.id;

  return (
    <form
      action="/api/customer-portal"
      method="post"
      target="_blank"
      onSubmit={async (event) => {
        if (subscription.data) return;
        event.preventDefault();
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
      <Button
        type="submit"
        name="priceId"
        value={price.id}
        ref={ref}
        data-selected={selected || isCurrentSubscription || undefined}
        accessibleWhenDisabled
        disabled={selected || isCurrentSubscription}
        {...props}
        render={
          <Command
            flat
            render={props.render}
            className="group flex h-24 w-full justify-between border-2 border-solid border-black/10 px-8 text-lg hover:cursor-pointer aria-disabled:cursor-default aria-disabled:opacity-100 data-[selected]:border-blue-600 dark:border-white/10 dark:data-[selected]:border-blue-500"
          />
        }
      >
        {isCurrentSubscription ? (
          <span className="absolute left-1 top-1 flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white">
            <Check strokeWidth={3} className="h-3 w-3" /> Current plan
          </span>
        ) : (
          !!price.difference && (
            <span className="absolute left-1 top-1 rounded bg-blue-600 p-1 text-xs text-white">
              {price.difference * 100}%
            </span>
          )
        )}
        <span className="font-medium">
          {price.yearly ? "Yearly" : "Monthly"}
        </span>
        <span className="text-end font-light text-black/70 dark:text-white/70">
          <span className="text-2xl tracking-wide text-black dark:text-white">
            $<span className="font-semibold">{price.amountByMonth / 100}</span>
          </span>{" "}
          / month
        </span>
        {price.yearly && monthlyPrice && (
          <span className="absolute bottom-3 text-xs font-medium tracking-wider group-active:bottom-[11px]">
            <del className="opacity-70">${monthlyPrice.amountByYear / 100}</del>{" "}
            ${price.amountByYear / 100} / year
          </span>
        )}
      </Button>
    </form>
  );
});

export interface PlusCheckoutFrameProps extends RoleProps<"div"> {}

export function PlusCheckoutFrame(props: PlusCheckoutFrameProps) {
  const store = useContext(PlusContext);
  invariant(store);

  const hasPriceId = store.useState((state) => !!state.priceId);
  const clientSecret = store.useState("clientSecret");

  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);
  const [visibility, setVisibility] =
    useState<CSSProperties["visibility"]>("hidden");

  useEffect(() => {
    if (!wrapper) return;

    let iframe = wrapper.querySelector<HTMLIFrameElement>("iframe");

    const onLoad = () => setVisibility("visible");

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

  if (!stripePromise) return null;
  if (!hasPriceId) return null;

  return (
    <Role.div
      {...props}
      className={twMerge("relative h-full", props.className)}
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
