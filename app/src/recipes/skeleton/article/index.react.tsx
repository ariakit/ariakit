import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import {
  Skeleton,
  SkeletonBox,
  SkeletonCircle,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { useRequest } from "../use-request.ts";

const post = {
  title: "Skeletons that match the page",
  author: "Priya Raman",
  initials: "PR",
  date: "October 19, 2026",
  readingTime: "4 min read",
  paragraphs: [
    "A loading state works best when it has the same shape as the content it replaces. Readers see where the title, the image, and the text will go, and nothing moves when they arrive.",
    "Each placeholder line takes the height of one line of text in its own font size, so a heading placeholder is taller than a paragraph placeholder.",
  ],
};

// Widths of the placeholder lines for each paragraph. The last line of a
// paragraph is shorter, like real text.
const paragraphLines = [
  ["w-full", "w-full", "w-3/5"],
  ["w-full", "w-1/3"],
];

export default function Example() {
  const { data, loading } = useRequest(post, 1800);
  return (
    <article aria-busy={loading} className="w-[36rem] max-w-full">
      <p role="status" className="sr-only">
        {loading ? "Loading article" : "Article loaded"}
      </p>
      <Skeleton loading={loading} className="grid gap-5">
        <HeadingLevel level={3}>
          <Heading $level={1} className="text-balance">
            <SkeletonLine $weight="medium" className="w-4/5">
              {data?.title}
            </SkeletonLine>
          </Heading>
        </HeadingLevel>
        <div className="flex items-center gap-3 text-sm">
          <SkeletonCircle className="size-9 shrink-0">
            <Frame
              $layer="secondary"
              $rounded="full"
              $forceRounded
              $p="none"
              aria-hidden
              className="grid size-9 shrink-0 place-items-center"
            >
              <span className="text-xs font-semibold">{data?.initials}</span>
            </Frame>
          </SkeletonCircle>
          <div className="grid">
            <SkeletonLine className="w-24">
              <span className="font-medium">{data?.author}</span>
            </SkeletonLine>
            <SkeletonLine $weight="light" className="w-40">
              <span className="ak-ink-70">
                {data?.date} · {data?.readingTime}
              </span>
            </SkeletonLine>
          </div>
        </div>
        <SkeletonBox $rounded="xl" className="aspect-[5/2] w-full">
          <Frame
            $layer="brand"
            $rounded="xl"
            $p="none"
            aria-hidden
            className="aspect-[5/2] w-full bg-radial-[at_25%_25%] from-white/25 to-transparent"
          />
        </SkeletonBox>
        {paragraphLines.map((lines, index) => (
          <p key={index} className="leading-relaxed text-pretty">
            {lines.map((width, lineIndex) => (
              <SkeletonLine key={lineIndex} className={width}>
                {lineIndex === 0 ? data?.paragraphs[index] : undefined}
              </SkeletonLine>
            ))}
          </p>
        ))}
      </Skeleton>
    </article>
  );
}
