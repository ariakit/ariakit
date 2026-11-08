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
  SkeletonCircle,
  SkeletonFill,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { useEffect, useState } from "react";

const POST_LATENCY = 500;
const COMMENTS_LATENCY = 2000;

const post = {
  title: "Release notes",
  text: "Color tokens now adapt to dark mode.",
};

const comments = [
  { id: "1", author: "Priya Raman", text: "The dark mode colors look great." },
  {
    id: "2",
    author: "Leo Martins",
    text: "Does this cover forced colors too?",
  },
];

// Simulates a request that resolves with `data` after `latency` milliseconds.
// While `pending` is true, the request does not resolve, like a stalled
// network.
function useRequest<T>(data: T, latency: number, pending = false) {
  const [response, setResponse] = useState<T>();
  useEffect(() => {
    if (pending) return;
    const timer = setTimeout(() => setResponse(data), latency);
    return () => clearTimeout(timer);
  }, [data, latency, pending]);
  return response;
}

export default function Example() {
  const data = useRequest(post, POST_LATENCY);
  const [showComments, setShowComments] = useState(false);
  const [keepLoading, setKeepLoading] = useState(false);
  return (
    <div className="grid w-md max-w-full gap-4">
      <CheckboxField
        checked={keepLoading}
        onChange={(event) => setKeepLoading(event.currentTarget.checked)}
      >
        <CheckboxLabel>Keep loading comments</CheckboxLabel>
      </CheckboxField>
      <Frame
        $lighten
        $rounded="xl"
        $border
        $p={4}
        render={<article aria-label="Post" aria-busy={!data} />}
        className="grid gap-4"
      >
        <p role="status" className="sr-only">
          {data ? "Post loaded" : "Loading post"}
        </p>
        <Skeleton loading={!data} className="grid gap-3">
          <SkeletonLine className="w-32">
            <h2 className="font-semibold">{data?.title}</h2>
          </SkeletonLine>
          <SkeletonLine className="w-full">
            <p>{data?.text}</p>
          </SkeletonLine>
          <SkeletonFill>
            <Button
              $kind="bevel"
              disabled={showComments}
              onClick={() => setShowComments(true)}
              className="justify-self-start"
            >
              Show comments
            </Button>
          </SkeletonFill>
          {/* The comments load in their own root inside the loaded post. */}
          {showComments && <Comments keepLoading={keepLoading} />}
        </Skeleton>
      </Frame>
    </div>
  );
}

interface CommentsProps {
  keepLoading: boolean;
}

function Comments({ keepLoading }: CommentsProps) {
  const data = useRequest(comments, COMMENTS_LATENCY, keepLoading);
  const loading = !data;
  return (
    <section aria-label="Comments" aria-busy={loading} className="grid gap-3">
      <p role="status" className="sr-only">
        {loading ? "Loading comments" : "Comments loaded"}
      </p>
      <Skeleton loading={loading} className="grid gap-3">
        {(data ?? comments).map((comment) => (
          <div key={comment.id} className="flex items-center gap-3 text-sm">
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
              <SkeletonLine className="w-24">
                <span className="font-medium">{data && comment.author}</span>
              </SkeletonLine>
              <SkeletonLine $weight="light" className="w-full">
                <span>{data && comment.text}</span>
              </SkeletonLine>
            </div>
          </div>
        ))}
      </Skeleton>
    </section>
  );
}
