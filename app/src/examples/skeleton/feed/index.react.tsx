import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Skeleton,
  SkeletonBox,
  SkeletonCircle,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { useEffect, useState } from "react";

interface Post {
  id: string;
  author: string;
  initials: string;
  time: string;
  text: string;
  image?: boolean;
}

const allPosts: Post[] = [
  {
    id: "1",
    author: "Priya Raman",
    initials: "PR",
    time: "2m",
    text: "Shipped the new color tokens today. Every surface now adapts to dark mode and to high contrast.",
    image: true,
  },
  {
    id: "2",
    author: "Leo Martins",
    initials: "LM",
    time: "18m",
    text: "Hot take: most loading spinners should be skeletons that match the final layout.",
  },
  {
    id: "3",
    author: "Ana Souza",
    initials: "AS",
    time: "1h",
    text: "Our docs search now answers in under 100 ms, so it never flashes a loading state.",
    image: true,
  },
  {
    id: "4",
    author: "Kenji Ito",
    initials: "KI",
    time: "3h",
    text: "Weekend project: a tiny synth that runs in the browser with the Web Audio API.",
  },
  {
    id: "5",
    author: "Maya Chen",
    initials: "MC",
    time: "5h",
    text: "Reminder that prefers-reduced-motion is not only for animations you think are large.",
    image: true,
  },
  {
    id: "6",
    author: "Omar Haddad",
    initials: "OH",
    time: "8h",
    text: "Pairing session on keyboard navigation for data grids. Arrow keys, Home, End, and Page Up.",
  },
];

const PAGE_SIZE = 2;
const LATENCY = 1200;

interface Page {
  posts?: Post[];
}

export default function Example() {
  const [pages, setPages] = useState<Page[]>([{}]);
  const loading = pages.some((page) => !page.posts);
  const hasMore = pages.length * PAGE_SIZE < allPosts.length;

  // Simulates a request for each page that has no posts yet.
  useEffect(() => {
    const index = pages.findIndex((page) => !page.posts);
    if (index === -1) return;
    const timer = setTimeout(() => {
      const start = index * PAGE_SIZE;
      const posts = allPosts.slice(start, start + PAGE_SIZE);
      setPages((pages) =>
        pages.map((page, i) => (i === index ? { posts } : page)),
      );
    }, LATENCY);
    return () => clearTimeout(timer);
  }, [pages]);

  return (
    <div className="grid w-[30rem] max-w-full gap-4">
      <section aria-label="Feed" aria-busy={loading} className="grid gap-3">
        <p role="status" className="sr-only">
          {loading ? "Loading posts" : ""}
        </p>
        {pages.map((page, pageIndex) => (
          // Each page is its own root, so loading the next page does not turn
          // the posts that are already visible back into placeholders.
          <Skeleton
            key={pageIndex}
            loading={!page.posts}
            className="grid gap-3"
          >
            {page.posts
              ? page.posts.map((post) => (
                  <PostCard key={post.id} post={post} image={post.image} />
                ))
              : placeholders.map((image, index) => (
                  <PostCard key={index} image={image} />
                ))}
          </Skeleton>
        ))}
      </section>
      {hasMore && (
        <Button
          $kind="bevel"
          disabled={loading}
          onClick={() => setPages((pages) => [...pages, {}])}
          className="justify-self-center"
        >
          Load more
        </Button>
      )}
    </div>
  );
}

// Whether each placeholder post shows an image. A mix looks like a real feed,
// and the sample posts follow the same pattern on every page, so the cards keep
// their height when the posts load.
const placeholders = [true, false];

interface PostCardProps {
  post?: Post;
  image?: boolean;
}

function PostCard({ post, image }: PostCardProps) {
  return (
    <Frame
      $layer
      $lighten
      $rounded="xl"
      $border
      $p={4}
      render={<article />}
      className="grid gap-3 shadow-xs"
    >
      <div className="flex items-center gap-3">
        <SkeletonCircle className="size-9 shrink-0">
          <Frame
            $layer="brand"
            $rounded="full"
            $forceRounded
            $p="none"
            aria-hidden
            className="grid size-9 shrink-0 place-items-center"
          >
            <span className="text-xs font-semibold">{post?.initials}</span>
          </Frame>
        </SkeletonCircle>
        <div className="flex min-w-0 flex-1 items-baseline gap-2 text-sm">
          <SkeletonLine $weight="medium" className="w-28">
            <span className="font-medium">{post?.author}</span>
          </SkeletonLine>
          <SkeletonLine $weight="light" className="w-6">
            <span className="ak-ink-70">{post?.time}</span>
          </SkeletonLine>
        </div>
      </div>
      <p>
        <SkeletonLine className="w-full">{post?.text}</SkeletonLine>
        <SkeletonLine className="w-2/3" />
      </p>
      {image && (
        <SkeletonBox $rounded="lg" className="aspect-[2/1] w-full">
          <Frame
            $layer="brand"
            $rounded="lg"
            $p="none"
            aria-hidden
            className="aspect-[2/1] w-full bg-linear-to-br from-transparent to-black/30"
          />
        </SkeletonBox>
      )}
    </Frame>
  );
}
