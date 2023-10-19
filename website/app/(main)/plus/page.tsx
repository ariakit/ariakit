"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Heading,
  HeadingLevel,
  Hovercard,
  HovercardAnchor,
  HovercardProvider,
} from "@ariakit/react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useQuery } from "@tanstack/react-query";
import { Command } from "components/command.jsx";
import { Popup } from "components/popup.jsx";
import { Check } from "icons/check.jsx";
import { ChevronRight } from "icons/chevron-right.jsx";
import { Heart } from "icons/heart.jsx";
import Image from "next/image.js";
import Link from "next/link.js";
import type { Price } from "../../api/prices/route.js";
import { checkout } from "./checkout.js";
import examplesImage from "./play-with-examples.png";

const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = key ? loadStripe(key) : null;

async function getPrices(): Promise<Price[]> {
  const res = await fetch("/api/prices");
  return res.json();
}

// TODO: This is a form
export default function Page() {
  const [feature, setFeature] = useState("development");
  const [secret, setSecret] = useState("");
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [visibility, setVisibility] = useState<"hidden" | "visible">("hidden");

  const query = useQuery({
    queryKey: ["prices"],
    queryFn: getPrices,
  });

  useEffect(() => {
    if (!el) return;
    setVisibility("hidden");
    let iframe: HTMLIFrameElement | null = null;
    const onLoad = () => {
      setVisibility("visible");
    };

    iframe = el.querySelector<HTMLIFrameElement>("iframe");

    const observer = new MutationObserver(() => {
      iframe?.removeEventListener("load", onLoad);
      iframe = el.querySelector<HTMLIFrameElement>("iframe");
      console.log(iframe);
      if (!iframe) return;
      iframe.addEventListener("load", onLoad);
      observer.disconnect();
    });
    observer.observe(el, { childList: true, subtree: true });

    return () => {
      iframe?.removeEventListener("load", onLoad);
      observer.disconnect();
    };
  }, [el]);
  return (
    <div className="flex flex-col items-center pt-16">
      <HeadingLevel>
        <Popup
          className="m-3 max-h-[75vh] max-w-[960px] rounded-3xl"
          scroller={<div className="flex flex-col gap-8 !p-0" />}
        >
          <HovercardProvider open={!!feature}>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 dark:bg-gray-700">
                <div className="sticky top-8 flex flex-col gap-8">
                  <Heading className="flex items-center gap-2 text-3xl font-semibold">
                    Ariakit Plus
                  </Heading>
                  <p className="text-sm text-black/80 dark:text-white/80">
                    Subscribe to Ariakit Plus to enjoy exclusive features and
                    content on the site, including:
                  </p>
                  <ul className="mb-8 flex cursor-default flex-col gap-2">
                    <HovercardAnchor
                      render={<li />}
                      onFocusVisible={() => setFeature("development")}
                      className="group relative flex gap-2 rounded-md p-2 data-[active]:bg-black/5 dark:data-[active]:bg-white/5"
                      data-active={feature === "development" || undefined}
                      showOnHover={() => {
                        setFeature("development");
                        return true;
                      }}
                    >
                      <Check
                        strokeWidth={3}
                        className="h-4 w-4 flex-none translate-y-1 stroke-green-700 dark:stroke-green-300"
                      />
                      <p>Edit examples using Vite and Next.js</p>
                      <ChevronRight className="ml-auto hidden h-4 w-4 flex-none translate-y-1 opacity-60 group-data-[active]:block" />
                    </HovercardAnchor>
                    <HovercardAnchor
                      render={<li />}
                      onFocusVisible={() => setFeature("support")}
                      data-active={feature === "support" || undefined}
                      className="group relative flex gap-2 rounded-md p-2 data-[active]:bg-black/5 dark:data-[active]:bg-white/5"
                      showOnHover={() => {
                        setFeature("support");
                        return true;
                      }}
                    >
                      <Heart className="h-4 w-4 flex-none translate-y-1 fill-pink-600 dark:fill-pink-500" />
                      <p>Support the project</p>
                      <ChevronRight className="ml-auto hidden h-4 w-4 flex-none translate-y-1 opacity-60 group-data-[active]:block" />
                    </HovercardAnchor>
                  </ul>
                  <div className="flex flex-col gap-6">
                    {query.data?.map((price, _, prices) => (
                      <Button
                        key={price.id}
                        className="group flex h-24 justify-between border-2 border-solid border-black/10 px-8 text-lg hover:cursor-pointer dark:border-white/10"
                        render={<Command flat />}
                        onClick={async () => {
                          const clientSecret = await checkout(
                            price.id,
                            globalThis.window.location.href,
                          );
                          if (!clientSecret) return;
                          setSecret(clientSecret);
                        }}
                      >
                        {price.yearly && (
                          <span className="absolute left-1 top-1 rounded bg-blue-600 p-1 text-xs font-semibold text-white">
                            {Math.round(
                              (price.amount /
                                (prices.find((price) => !price.yearly)!.amount *
                                  12) -
                                1) *
                                100,
                            )}
                            %
                          </span>
                        )}
                        <span className="font-medium">
                          {price.yearly ? "Yearly" : "Monthly"}
                        </span>
                        <span className="text-end font-light text-black/70 dark:text-white/70">
                          <span className="text-2xl tracking-wide text-black dark:text-white">
                            $
                            <span className="font-semibold">
                              {(price.yearly
                                ? price.amount / 12
                                : price.amount) / 100}
                            </span>
                          </span>{" "}
                          / month
                        </span>
                        {price.yearly && (
                          <span className="absolute bottom-3 text-xs font-medium tracking-wider group-active:bottom-[11px]">
                            <del className="opacity-70">
                              $
                              {prices.find((price) => !price.yearly)!.amount *
                                0.12}
                            </del>{" "}
                            ${price.amount / 100} / year
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                  <p className="mt-4 self-end">
                    Already a member?{" "}
                    <Link href="/plus" className="font-medium text-blue-300">
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-8 overflow-auto bg-gray-800 p-8">
                <Hovercard
                  focusable={false}
                  disablePointerEventsOnApproach
                  hideOnHoverOutside={false}
                  hideOnInteractOutside={false}
                  hideOnEscape={false}
                  updatePosition={() => {}}
                  wrapperProps={{
                    style: { position: "relative", width: "100%" },
                  }}
                >
                  {secret && stripePromise ? (
                    <div ref={setEl} style={{ visibility }} key={secret}>
                      <EmbeddedCheckoutProvider
                        stripe={stripePromise}
                        options={{ clientSecret: secret }}
                      >
                        <EmbeddedCheckout className="-mx-8" />
                      </EmbeddedCheckoutProvider>
                    </div>
                  ) : feature === "development" ? (
                    <div className="flex flex-col gap-4">
                      <HeadingLevel>
                        <Heading className="text-2xl font-semibold">
                          Edit examples
                        </Heading>
                        <div className="h-52 overflow-hidden rounded-md">
                          <Image
                            src={examplesImage}
                            alt="Interacting with the open example in a new tab dropdown menu"
                          />
                        </div>
                        <p>
                          Open examples on StackBlitz and play with them right
                          in your browser without having to install anything.
                        </p>
                        <p>Choose between Vite and Next.js</p>
                      </HeadingLevel>
                    </div>
                  ) : (
                    feature === "support" && (
                      <div className="flex flex-col gap-4">
                        <HeadingLevel>
                          <Heading className="text-2xl font-semibold">
                            Support the project
                          </Heading>
                          <div className="h-36 overflow-hidden rounded-md bg-gradient-to-br from-pink-400 to-blue-400 dark:from-pink-600 dark:to-blue-600">
                            <Heart className="h-full w-full fill-white" />
                          </div>
                          <p>
                            Ariakit is an independent open-source project. Your
                            support enables us to keep improving and maintaining
                            it.
                          </p>
                          <p>
                            If you are using Ariakit at work and find it
                            enhances your productivity, consider giving back.
                          </p>
                        </HeadingLevel>
                      </div>
                    )
                  )}
                </Hovercard>
              </div>
            </div>
          </HovercardProvider>
        </Popup>
      </HeadingLevel>
    </div>
  );
}
