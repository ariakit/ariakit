/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  CheckboxField,
  CheckboxLabel,
} from "@ariakit/ui/components/checkbox.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Skeleton,
  SkeletonBox,
  SkeletonCircle,
  SkeletonFill,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { useEffect, useState } from "react";

const CARD_COUNT = 24;
const LATENCY = 2000;

const people = Array.from({ length: CARD_COUNT }, (_, index) => ({
  id: index,
  name: `Person ${index + 1}`,
  role: index % 2 ? "Designer" : "Engineer",
}));

type Person = (typeof people)[number];

export default function Example() {
  const [requestId, setRequestId] = useState(0);
  const [loadedId, setLoadedId] = useState<number>();
  const [keepLoading, setKeepLoading] = useState(false);
  const loading = loadedId !== requestId;

  // Simulates a request that resolves after a fixed latency, so the
  // placeholders animate for the same time on every reload. While "Keep
  // loading" is checked, the request stays pending, like a stalled network.
  useEffect(() => {
    if (keepLoading) return;
    const timer = setTimeout(() => setLoadedId(requestId), LATENCY);
    return () => clearTimeout(timer);
  }, [requestId, keepLoading]);

  return (
    <div className="grid gap-4 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <Button
          $kind="bevel"
          disabled={loading}
          onClick={() => setRequestId((id) => id + 1)}
        >
          Reload
        </Button>
        <CheckboxField
          checked={keepLoading}
          onChange={(event) => setKeepLoading(event.currentTarget.checked)}
        >
          <CheckboxLabel>Keep loading</CheckboxLabel>
        </CheckboxField>
      </div>
      <section aria-label="People" aria-busy={loading}>
        <p role="status" className="sr-only">
          {loading ? "Loading people" : ""}
        </p>
        <Skeleton
          loading={loading}
          className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3"
        >
          {people.map((person) => (
            <PersonCard key={person.id} person={loading ? undefined : person} />
          ))}
        </Skeleton>
      </section>
    </div>
  );
}

interface PersonCardProps {
  person?: Person;
}

function PersonCard({ person }: PersonCardProps) {
  return (
    <Frame
      $layer
      $lighten
      $rounded="xl"
      $border
      $p={2}
      render={<article />}
      className="grid gap-2 text-sm"
    >
      <SkeletonBox $rounded="lg" className="aspect-[2/1] w-full">
        <Frame
          $layer="brand"
          $rounded="lg"
          $p="none"
          aria-hidden
          className="aspect-[2/1] w-full"
        />
      </SkeletonBox>
      <div className="flex items-center gap-2">
        <SkeletonCircle className="size-8 shrink-0">
          <Frame
            $layer="secondary"
            $rounded="full"
            $forceRounded
            $p="none"
            aria-hidden
            className="size-8 shrink-0"
          />
        </SkeletonCircle>
        <div className="grid min-w-0 flex-1">
          <SkeletonLine $weight="medium" className="w-4/5">
            <span className="truncate font-medium">{person?.name}</span>
          </SkeletonLine>
          <SkeletonLine $weight="light" className="w-1/2">
            <span className="truncate ak-ink-70">{person?.role}</span>
          </SkeletonLine>
        </div>
      </div>
      <SkeletonFill>
        <Button $layer="brand" $kind="bevel" className="justify-self-start">
          Follow
        </Button>
      </SkeletonFill>
    </Frame>
  );
}
