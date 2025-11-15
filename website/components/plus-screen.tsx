"use client";
import { Heading, HeadingLevel } from "@ariakit/react";
import Link from "next/link.js";
import { useSearchParams } from "next/navigation.js";
import { Heart } from "@/icons/heart.tsx";
import { Nextjs } from "@/icons/nextjs.tsx";
import { Vite } from "@/icons/vite.tsx";
import { usePrice } from "@/lib/use-price.ts";
import { CodePlaceholder } from "./code-placeholder.tsx";
import { Focusable } from "./focusable.tsx";
import { InlineLink } from "./inline-link.tsx";
import {
  PlusCheckoutButton,
  PlusCheckoutFrame,
  PlusFeature,
  PlusFeaturePreview,
  PlusFeaturePreviewContainer,
  PlusProvider,
} from "./plus.tsx";
import { PlusBordered } from "./plus-bordered.tsx";

export function PlusScreen() {
  const searchParams = useSearchParams();
  const query = usePrice();
  const defaultFeature = searchParams.get("feature") ?? "examples";
  return (
    <HeadingLevel>
      <PlusProvider defaultFeature={defaultFeature}>
        <div className="flex flex-col items-center gap-8 sm:gap-12">
          <Heading className="text-center text-5xl font-semibold sm:text-6xl">
            Ariakit{" "}
            <PlusBordered
              thick
              className="inline-block rounded-xl bg-gray-50 p-1 sm:px-2 dark:bg-gray-800"
            >
              Plus
            </PlusBordered>
          </Heading>
          <p className="mx-3 max-w-[620px] -translate-y-5 text-center text-lg font-light text-black/80 sm:text-xl dark:text-white/80 [&>strong]:font-medium [&>strong]:text-black [&>strong]:dark:font-semibold [&>strong]:dark:text-white">
            Ariakit is a <strong>free</strong>, open-source project.{" "}
            <strong>Ariakit Plus</strong> gives you access to exclusive content
            and features on the site, <strong>forever</strong>.
          </p>
          <div className="grid w-[1024px] max-w-full grid-cols-1 gap-y-8 md:grid-cols-2">
            <div>
              <div className="top-20 flex w-full flex-col gap-8 rounded-xl bg-white p-8 py-8 [box-shadow:0_0_0_1px_rgb(0_0_0/0.08),0_16px_36px_-12px_rgb(0_0_0/0.25)] sm:rounded-2xl md:sticky dark:bg-gray-700 dark:[box-shadow:0_0_0_1px_rgb(255_255_255/0.15),0_16px_36px_-12px_rgb(0_0_0/0.35)]">
                <Heading className="text-2xl font-medium">All included</Heading>
                <ul className="mb-8 flex cursor-default flex-col gap-2">
                  <PlusFeature
                    feature="examples"
                    render={<Focusable flat render={<li />} />}
                  >
                    Access all examples
                  </PlusFeature>
                  <PlusFeature
                    feature="edit-examples"
                    render={<Focusable flat render={<li />} />}
                  >
                    Edit examples
                  </PlusFeature>
                  <PlusFeature
                    feature="preview-docs"
                    disabled
                    className="aria-disabled:opacity-50"
                    render={<Focusable flat render={<li />} />}
                  >
                    Preview API docs{" "}
                    <span className="uppercase ms-2 text-xs px-1.5 py-1 rounded bg-black/60 dark:bg-white/60 text-white dark:text-black font-semibold">
                      Soon
                    </span>
                  </PlusFeature>
                  <PlusFeature
                    feature="support"
                    icon="heart"
                    render={<Focusable flat render={<li />} />}
                  >
                    Support the mission
                  </PlusFeature>
                </ul>
                <div className="flex flex-col gap-4">
                  <PlusCheckoutButton price={query.data} />
                  <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-light text-black/40 dark:text-white/40 [&>div]:text-black/80 [&>div]:dark:text-white/80">
                    <div>One-time purchase.</div>
                    <div>Lifetime access.</div>
                    <div>Free updates.</div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4 text-sm font-light text-black/70 dark:border-white/10 dark:text-white/70">
                  <InlineLink
                    className="text-inherit hover:text-black dark:text-inherit dark:hover:text-white"
                    render={<Link href="/plus/license" />}
                  >
                    License Agreement
                  </InlineLink>
                  <div className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 150 34"
                      aria-label="Powered by Stripe"
                      className="h-6 w-auto fill-current"
                    >
                      <path d="M146,0H3.73A3.73,3.73,0,0,0,0,3.73V30.27A3.73,3.73,0,0,0,3.73,34H146a4,4,0,0,0,4-4V4A4,4,0,0,0,146,0Zm3,30a3,3,0,0,1-3,3H3.73A2.74,2.74,0,0,1,1,30.27V3.73A2.74,2.74,0,0,1,3.73,1H146a3,3,0,0,1,3,3Z" />
                      <path d="M17.07,11.24h-4.3V22h1.92V17.84h2.38c2.4,0,3.9-1.16,3.9-3.3S19.47,11.24,17.07,11.24Zm-.1,5H14.69v-3.3H17c1.38,0,2.11.59,2.11,1.65S18.35,16.19,17,16.19Z" />
                      <path d="M25.1,14a3.77,3.77,0,0,0-3.8,4.09,3.81,3.81,0,1,0,7.59,0A3.76,3.76,0,0,0,25.1,14Zm0,6.67c-1.22,0-2-1-2-2.58s.76-2.58,2-2.58,2,1,2,2.58S26.31,20.66,25.1,20.66Z" />
                      <polygon points="36.78 19.35 35.37 14.13 33.89 14.13 32.49 19.35 31.07 14.13 29.22 14.13 31.59 22.01 33.15 22.01 34.59 16.85 36.03 22.01 37.59 22.01 39.96 14.13 38.18 14.13 36.78 19.35" />
                      <path d="M44,14a3.83,3.83,0,0,0-3.75,4.09,3.79,3.79,0,0,0,3.83,4.09A3.47,3.47,0,0,0,47.49,20L46,19.38a1.78,1.78,0,0,1-1.83,1.26A2.12,2.12,0,0,1,42,18.47h5.52v-.6C47.54,15.71,46.32,14,44,14Zm-1.93,3.13A1.92,1.92,0,0,1,44,15.5a1.56,1.56,0,0,1,1.69,1.62Z" />
                      <path d="M50.69,15.3V14.13h-1.8V22h1.8V17.87a1.89,1.89,0,0,1,2-2,4.68,4.68,0,0,1,.66,0v-1.8c-.14,0-.3,0-.51,0A2.29,2.29,0,0,0,50.69,15.3Z" />
                      <path d="M57.48,14a3.83,3.83,0,0,0-3.75,4.09,3.79,3.79,0,0,0,3.83,4.09A3.47,3.47,0,0,0,60.93,20l-1.54-.59a1.78,1.78,0,0,1-1.83,1.26,2.12,2.12,0,0,1-2.1-2.17H61v-.6C61,15.71,59.76,14,57.48,14Zm-1.93,3.13a1.92,1.92,0,0,1,1.92-1.62,1.56,1.56,0,0,1,1.69,1.62Z" />
                      <path d="M67.56,15a2.85,2.85,0,0,0-2.26-1c-2.21,0-3.47,1.85-3.47,4.09s1.26,4.09,3.47,4.09a2.82,2.82,0,0,0,2.26-1V22h1.8V11.24h-1.8Zm0,3.35a2,2,0,0,1-2,2.28c-1.31,0-2-1-2-2.52s.7-2.52,2-2.52c1.11,0,2,.81,2,2.29Z" />
                      <path d="M79.31,14A2.88,2.88,0,0,0,77,15V11.24h-1.8V22H77v-.83a2.86,2.86,0,0,0,2.27,1c2.2,0,3.46-1.86,3.46-4.09S81.51,14,79.31,14ZM79,20.6a2,2,0,0,1-2-2.28v-.47c0-1.48.84-2.29,2-2.29,1.3,0,2,1,2,2.52S80.25,20.6,79,20.6Z" />
                      <path d="M86.93,19.66,85,14.13H83.1L86,21.72l-.3.74a1,1,0,0,1-1.14.79,4.12,4.12,0,0,1-.6,0v1.51a4.62,4.62,0,0,0,.73.05,2.67,2.67,0,0,0,2.78-2l3.24-8.62H88.82Z" />
                      <path d="M125,12.43a3,3,0,0,0-2.13.87l-.14-.69h-2.39V25.53l2.72-.59V21.81a3,3,0,0,0,1.93.7c1.94,0,3.72-1.59,3.72-5.11C128.71,14.18,126.91,12.43,125,12.43Zm-.65,7.63a1.61,1.61,0,0,1-1.28-.52l0-4.11a1.64,1.64,0,0,1,1.3-.55c1,0,1.68,1.13,1.68,2.58S125.36,20.06,124.35,20.06Z" />
                      <path d="M133.73,12.43c-2.62,0-4.21,2.26-4.21,5.11,0,3.37,1.88,5.08,4.56,5.08a6.12,6.12,0,0,0,3-.73V19.64a5.79,5.79,0,0,1-2.7.62c-1.08,0-2-.39-2.14-1.7h5.38c0-.15,0-.74,0-1C137.71,14.69,136.35,12.43,133.73,12.43Zm-1.47,4.07c0-1.26.77-1.79,1.45-1.79s1.4.53,1.4,1.79Z" />
                      <path d="M113,13.36l-.17-.82h-2.32v9.71h2.68V15.67a1.87,1.87,0,0,1,2.05-.58V12.54A1.8,1.8,0,0,0,113,13.36Z" />
                      <path d="M99.46,15.46c0-.44.36-.61.93-.61a5.9,5.9,0,0,1,2.7.72V12.94a7,7,0,0,0-2.7-.51c-2.21,0-3.68,1.18-3.68,3.16,0,3.1,4.14,2.6,4.14,3.93,0,.52-.44.69-1,.69a6.78,6.78,0,0,1-3-.9V22a7.38,7.38,0,0,0,3,.64c2.26,0,3.82-1.15,3.82-3.16C103.62,16.12,99.46,16.72,99.46,15.46Z" />
                      <path d="M107.28,10.24l-2.65.58v8.93a2.77,2.77,0,0,0,2.82,2.87,4.16,4.16,0,0,0,1.91-.37V20c-.35.15-2.06.66-2.06-1V15h2.06V12.66h-2.06Z" />
                      <polygon points="116.25 11.7 118.98 11.13 118.98 8.97 116.25 9.54 116.25 11.7" />
                      <rect x="116.25" y="12.61" width="2.73" height="9.64" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <PlusCheckoutFrame className="overflow-hidden rounded-xl bg-gray-50 sm:rounded-2xl md:mx-8" />
              <PlusFeaturePreviewContainer className="text-pretty p-8">
                <PlusFeaturePreview
                  feature="examples"
                  heading="Access all examples"
                >
                  <div className="flex cursor-default flex-col items-center gap-6 overflow-hidden rounded-lg bg-black/5 px-14 pt-6 dark:bg-gray-850">
                    <div className="h-20 w-full rounded-md border-2 border-dashed border-black/20 dark:border-gray-600" />
                    <div className="w-full overflow-hidden rounded-lg rounded-b-none border border-b-0 border-gray-300 bg-gray-150 dark:border-gray-650 dark:bg-gray-850">
                      <div className="flex items-center justify-end border-b border-[inherit] bg-gray-100 p-2 dark:bg-gray-800">
                        <div className="relative select-none rounded bg-black/10 px-3 text-sm leading-8 dark:bg-white/10">
                          Copy code
                          <div className="absolute -bottom-3 left-10">
                            <svg
                              strokeWidth={1.5}
                              viewBox="0 0 24 24"
                              className="size-6 fill-white stroke-black dark:fill-black dark:stroke-white"
                            >
                              <polygon points="6 3 18 14 13 15 16 20.5 13 22 10 16 6 19" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="h-16 bg-white p-4 dark:bg-gray-900">
                        <CodePlaceholder />
                      </div>
                    </div>
                  </div>
                  <p>
                    Get lifetime access to a{" "}
                    <InlineLink render={<Link href="/tags/plus" />}>
                      growing collection of exclusive examples
                    </InlineLink>
                    , including their complete source code and documentation.
                  </p>
                  <p>
                    This includes every example available today, plus all future
                    examples.
                  </p>
                </PlusFeaturePreview>
                <PlusFeaturePreview
                  feature="edit-examples"
                  heading="Edit examples"
                >
                  <div className="flex cursor-default flex-col items-center gap-6 overflow-hidden rounded-lg bg-black/5 p-6 dark:bg-gray-850">
                    <div className="h-20 w-[200px] rounded-md border-2 border-dashed border-black/20 dark:border-gray-600" />
                    <div className="flex gap-2 text-sm">
                      <div className="relative flex h-8 items-center gap-2 rounded-md bg-black/15 pl-2 pr-3 dark:bg-gray-600">
                        <Vite className="h-4 w-4" />
                        Vite
                        <div className="absolute -bottom-4 left-8">
                          <svg
                            strokeWidth={1.5}
                            viewBox="0 0 24 24"
                            className="h-5 w-5 fill-white stroke-black dark:fill-black dark:stroke-white"
                          >
                            <polygon points="6 3 18 14 13 15 16 20.5 13 22 10 16 6 19" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex h-8 items-center gap-2 rounded bg-black/10 pl-2 pr-3 dark:bg-gray-700">
                        <Nextjs className="h-4 w-4" />
                        Next.js
                      </div>
                    </div>
                  </div>
                  <p>
                    Edit examples in the browser using Vite and Next.js without
                    having to install anything.
                  </p>
                  <p>
                    Reproduce issues or quickly test something out using an
                    existing example as a starting point.
                  </p>
                </PlusFeaturePreview>
                <PlusFeaturePreview
                  feature="preview-docs"
                  heading="Preview API docs"
                >
                  <div className="flex cursor-default flex-col items-center gap-3 overflow-hidden rounded-lg bg-black/5 p-6 dark:bg-gray-850">
                    <div className="flex w-[200px] flex-col gap-3 rounded-lg border border-gray-250 bg-white p-3 text-black outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                      <div className="text-lg font-semibold">Component</div>
                      <div className="flex flex-col gap-3">
                        <div className="h-3 w-full rounded-sm bg-black/30 dark:bg-white/40" />
                        <div className="h-3 w-1/3 rounded-sm bg-black/30 dark:bg-white/40" />
                      </div>
                    </div>
                    <p className="w-[120%] self-start">
                      <span className="blur-[3px]">You can use </span>
                      <code className="font-monospace rounded bg-black/[7.5%] px-[0.3em] pb-1.5 pt-1 font-medium text-[#227289] underline decoration-dotted decoration-1 underline-offset-[0.25em] [text-decoration-skip-ink:none] dark:bg-white/[7.5%] dark:text-[#4ec9b0]">
                        Component
                      </code>
                      <span className="blur-[3px]">
                        {" "}
                        to render a wrapper around child components.
                      </span>
                    </p>
                  </div>
                  <p>
                    Quickly preview comprehensive API documentation by simply
                    hovering over the relevant API link on our site.
                  </p>
                  <p>
                    No more need to navigate away from the current page. Avoid
                    constant tab switching and focus on what matters.
                  </p>
                </PlusFeaturePreview>
                <PlusFeaturePreview
                  feature="support"
                  heading="Support the mission"
                >
                  <div className="h-40 overflow-hidden rounded-md bg-gradient-to-br from-pink-400 to-blue-400 p-4 dark:from-pink-600 dark:to-blue-600">
                    <Heart className="h-full w-full fill-white" />
                  </div>
                  <p>
                    Ariakit is an independent open-source project. Your support
                    enables us to keep improving and maintaining the library.
                  </p>
                  <p>
                    We spend thousands of hours crafting examples and primitive
                    components, testing them across different browsers and
                    assistive technologies.
                  </p>
                  <p>
                    If you are using Ariakit at work and it&apos;s saving you
                    time and money, consider giving back.
                  </p>
                </PlusFeaturePreview>
              </PlusFeaturePreviewContainer>
            </div>
          </div>
        </div>
      </PlusProvider>
    </HeadingLevel>
  );
}
