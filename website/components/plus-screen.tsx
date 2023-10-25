"use client";
import {
  Button,
  Heading,
  HeadingLevel,
  useDialogContext,
} from "@ariakit/react";
import { ArrowLeft } from "icons/arrow-left.jsx";
import { Heart } from "icons/heart.jsx";
import { Nextjs } from "icons/nextjs.jsx";
import { Vite } from "icons/vite.jsx";
import Link from "next/link.js";
import { useRouter, useSearchParams } from "next/navigation.js";
import { usePrices } from "utils/use-prices.js";
import { Command } from "./command.jsx";
import { Focusable } from "./focusable.jsx";
import { InlineLink } from "./inline-link.jsx";
import {
  PlusCheckoutButton,
  PlusCheckoutFrame,
  PlusFeature,
  PlusFeaturePreview,
  PlusFeaturePreviewContainer,
  PlusProvider,
} from "./plus.jsx";

export function PlusScreen() {
  const router = useRouter();
  const parentDialog = useDialogContext();
  const searchParams = useSearchParams();
  const query = usePrices();
  const monthlyPrice = query.data?.find((price) => !price.yearly);
  const defaultFeature = searchParams.get("feature") ?? "edit-examples";
  return (
    <HeadingLevel>
      <PlusProvider defaultFeature={defaultFeature}>
        <div className="grid grid-cols-1 gap-y-8 md:grid-cols-2">
          <div>
            <div className="top-20 flex flex-col gap-8 rounded-xl bg-gray-100 p-3 py-8 dark:bg-gray-700 sm:p-8 md:sticky [[role=dialog]_&]:top-0 [[role=dialog]_&]:bg-white dark:[[role=dialog]_&]:bg-gray-700">
              {parentDialog && (
                <Button
                  className="-mb-6 -ml-4 -mt-4 self-start text-sm text-black/80 dark:text-white/80"
                  onClick={router.back}
                  render={<Command variant="secondary" flat />}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to page
                </Button>
              )}
              <Heading className="flex items-center gap-2 text-3xl font-semibold">
                Ariakit Plus
              </Heading>
              <p className="text-sm text-black/80 dark:text-white/80">
                Subscribe to Ariakit Plus to enjoy exclusive features and
                content on the site, including:
              </p>
              <ul className="mb-8 flex cursor-default flex-col gap-2">
                <PlusFeature
                  feature="edit-examples"
                  render={<Focusable flat render={<li />} />}
                >
                  Edit examples
                </PlusFeature>
                <PlusFeature
                  feature="support"
                  icon="heart"
                  render={<Focusable flat render={<li />} />}
                >
                  Support the project
                </PlusFeature>
              </ul>
              <div className="flex flex-col gap-6">
                {query.isLoading &&
                  Array.from({ length: 2 }, (_, index) => (
                    <PlusCheckoutButton key={index} />
                  ))}
                {query.data?.map((price) => {
                  return (
                    <PlusCheckoutButton
                      key={price.id}
                      price={price}
                      monthlyPrice={monthlyPrice}
                    />
                  );
                })}
              </div>
              <p className="mt-4 self-end text-sm">
                Already a member?{" "}
                <InlineLink
                  className="no-underline hover:underline"
                  render={<Link href="/sign-in" />}
                >
                  Sign In
                </InlineLink>
              </p>
            </div>
          </div>
          <div className="[[role=dialog]_&]:bg-gray-150 dark:[[role=dialog]_&]:bg-gray-800">
            <div className="[[role=dialog]_&]:py-8">
              <PlusCheckoutFrame className="overflow-hidden rounded-xl bg-gray-50 md:mx-8 [[role=dialog]_&]:mx-8" />
            </div>
            <PlusFeaturePreviewContainer className="p-8 [[role=dialog]_&]:-mt-8">
              <PlusFeaturePreview
                feature="edit-examples"
                heading="Edit examples"
              >
                <div className="flex cursor-default flex-col items-center gap-6 overflow-hidden rounded-lg bg-black/5 p-6 dark:bg-gray-850">
                  <div className="h-20 w-[200px] rounded-md border-2 border-dashed border-black/20 dark:border-gray-600" />
                  <div className="flex gap-2 text-sm">
                    <div className="relative flex h-8 items-center gap-2 rounded-md bg-black/[15%] pl-2 pr-3 dark:bg-gray-600">
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
                  Edit Ariakit examples in the browser using Vite and Next.js
                  without having to install anything.
                </p>
                <p>
                  Reproduce issues or quickly test something out using an
                  existing example as a starting point.
                </p>
              </PlusFeaturePreview>
              <PlusFeaturePreview
                feature="support"
                heading="Support the project"
              >
                <div className="h-36 overflow-hidden rounded-md bg-gradient-to-br from-pink-400 to-blue-400 dark:from-pink-600 dark:to-blue-600">
                  <Heart className="h-full w-full fill-white" />
                </div>
                <p>
                  Ariakit is an independent open-source project. Your support
                  enables us to keep improving and maintaining the library.
                </p>
                <p>
                  We spend thousands of hours building primitive components and
                  testing them across various browsers and assistive
                  technologies, so you can focus on your product.
                </p>
                <p>
                  If you are using Ariakit at work and it&apos;s saving you time
                  and money, consider giving back.
                </p>
              </PlusFeaturePreview>
            </PlusFeaturePreviewContainer>
          </div>
        </div>
      </PlusProvider>
    </HeadingLevel>
  );
}
