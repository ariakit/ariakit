import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellMain,
  ShellMainBody,
  ShellMainIntro,
  ShellSidebar,
  ShellSidebarBody,
} from "@ariakit/ui/components/shell.ariakit.react";
import {
  Toc,
  TocItem,
  TocLink,
  TocList,
} from "@ariakit/ui/components/toc.ariakit.react";
import { Fragment } from "react";

interface Chapter {
  slug: string;
  title: string;
  lessons: { slug: string; title: string }[];
}

const chapters: Chapter[] = [
  {
    slug: "chapter-basics",
    title: "Basics",
    lessons: [
      { slug: "lesson-components", title: "Components" },
      { slug: "lesson-props", title: "Props" },
    ],
  },
  {
    slug: "chapter-state",
    title: "State and effects",
    lessons: [
      { slug: "lesson-state", title: "Adding state" },
      { slug: "lesson-effects", title: "Effects" },
    ],
  },
  {
    slug: "chapter-data",
    title: "Working with data",
    lessons: [],
  },
  {
    slug: "chapter-forms",
    title: "Forms",
    lessons: [{ slug: "lesson-validation", title: "Validation" }],
  },
];

const text =
  "Read the lesson, then try the exercise at the end. Each lesson builds on the one before it, so take them in order.";

// The article text gets smaller in a narrow frame, so the sidebar keeps its
// room beside it.
const articleClass = "text-[length:clamp(0.625rem,2.5cqi,1rem)]";

export default function Example() {
  return (
    <Shell>
      <ShellMain>
        <ShellMainIntro>
          {/* The intro ends with the space that the first heading of the body
              drops from its top margin, as the other sections have. */}
          <Prose className={`${articleClass} pb-[1.75em]`}>
            <Heading render={<h1 />}>React for designers</Heading>
            <p>A course in four chapters, from components to forms.</p>
          </Prose>
        </ShellMainIntro>
        <ShellMainBody>
          <Prose className={articleClass}>
            {chapters.map((chapter, index) => (
              <Fragment key={chapter.slug}>
                <Heading id={chapter.slug} render={<h2 />}>
                  <a href={`#${chapter.slug}`}>
                    {index + 1}. {chapter.title}
                  </a>
                </Heading>
                <p>{text}</p>
                {chapter.lessons.map((lesson) => (
                  <Fragment key={lesson.slug}>
                    <Heading id={lesson.slug} render={<h3 />}>
                      <a href={`#${lesson.slug}`}>{lesson.title}</a>
                    </Heading>
                    <p>{text}</p>
                  </Fragment>
                ))}
              </Fragment>
            ))}
          </Prose>
        </ShellMainBody>
      </ShellMain>
      <ShellSidebar
        $side="end"
        $show
        $from="body"
        $border={false}
        $layer="transparent"
      >
        <ShellSidebarBody>
          {/* The ordered list numbers the chapters on the guide, and the
              ordered list element gives their order to screen readers. A ring
              lights up around each number where the thumb passes. */}
          <Toc label="Chapters" ordered $cover>
            {chapters.map((chapter) => {
              const href = `#${chapter.slug}`;
              if (!chapter.lessons.length) {
                return (
                  <TocLink key={chapter.slug} href={href}>
                    {chapter.title}
                  </TocLink>
                );
              }
              return (
                <TocItem key={chapter.slug}>
                  <TocLink href={href}>{chapter.title}</TocLink>
                  <TocList>
                    {chapter.lessons.map((lesson) => (
                      <TocLink key={lesson.slug} href={`#${lesson.slug}`}>
                        {lesson.title}
                      </TocLink>
                    ))}
                  </TocList>
                </TocItem>
              );
            })}
          </Toc>
        </ShellSidebarBody>
      </ShellSidebar>
    </Shell>
  );
}
