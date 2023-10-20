"use client";
import { Heading, HeadingLevel } from "@ariakit/react";
import { useQuery } from "@tanstack/react-query";
import {
  PlusCheckoutButton,
  PlusCheckoutFrame,
  PlusFeature,
  PlusFeaturePreview,
  PlusFeaturePreviewContainer,
  PlusProvider,
} from "components/plus.jsx";
import { Heart } from "icons/heart.jsx";
import Image from "next/image.js";
import Link from "next/link.js";
import type { Price } from "utils/subscription.js";
import examplesImage from "./play-with-examples.png";

async function getPrices(): Promise<Price[]> {
  const res = await fetch("/api/prices");
  return res.json();
}

export default function Page() {
  const query = useQuery({
    queryKey: ["prices"],
    queryFn: getPrices,
  });

  const monthlyPrice = query.data?.find((price) => !price.yearly);

  return (
    <div className="flex flex-col items-center py-8 sm:py-16 md:pt-32">
      <HeadingLevel>
        <div className="m-3 max-w-[960px]">
          <PlusProvider defaultFeature="edit-examples">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="">
                <div className="top-20 flex flex-col gap-8 rounded-xl bg-gray-700 p-3 py-8 sm:p-8 md:sticky">
                  <Heading className="flex items-center gap-2 text-3xl font-semibold">
                    Ariakit Plus
                  </Heading>
                  <p className="text-sm text-black/80 dark:text-white/80">
                    Subscribe to Ariakit Plus to enjoy exclusive features and
                    content on the site, including:
                  </p>
                  <ul className="mb-8 flex cursor-default flex-col gap-2">
                    <PlusFeature feature="edit-examples" render={<li />}>
                      Edit examples
                    </PlusFeature>
                    <PlusFeature feature="support" icon="heart" render={<li />}>
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
                  <p className="mt-4 self-end">
                    Already a member?{" "}
                    <Link href="/sign-in" className="font-medium text-blue-300">
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-8 rounded-2xl p-8">
                <PlusCheckoutFrame className="md:-mx-8 md:-mt-40" />
                <PlusFeaturePreviewContainer>
                  <PlusFeaturePreview
                    feature="edit-examples"
                    heading="Edit examples"
                  >
                    <div className="h-52 overflow-hidden rounded-md">
                      <Image
                        src={examplesImage}
                        alt="Interacting with the open example in a new tab dropdown menu"
                      />
                    </div>
                    <p>
                      Open examples on StackBlitz and play with them right in
                      your browser without having to install anything.
                    </p>
                    <p>Choose between Vite and Next.js</p>
                  </PlusFeaturePreview>
                  <PlusFeaturePreview
                    feature="support"
                    heading="Support the project"
                  >
                    <div className="h-36 overflow-hidden rounded-md bg-gradient-to-br from-pink-400 to-blue-400 dark:from-pink-600 dark:to-blue-600">
                      <Heart className="h-full w-full fill-white" />
                    </div>
                    <p>
                      Ariakit is an independent open-source project. Your
                      support enables us to keep improving and maintaining it.
                    </p>
                    <p>
                      If you are using Ariakit at work and find it enhances your
                      productivity, consider giving back.
                    </p>
                  </PlusFeaturePreview>
                </PlusFeaturePreviewContainer>
              </div>
            </div>
          </PlusProvider>
        </div>
      </HeadingLevel>
    </div>
  );
}
