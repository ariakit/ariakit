import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { ListItemMarker } from "@ariakit/ui/components/list.ariakit.react";
import {
  Nav,
  NavDisclosure,
  NavDisclosureButton,
  NavLink,
  NavLinkContent,
  NavLinkDescription,
  NavLinkLabel,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { Progress } from "@ariakit/ui/components/progress.ariakit.react";
import { Lock } from "lucide-react";
import type { MouseEvent } from "react";
import { useState } from "react";

interface Lesson {
  title: string;
  duration: string;
  done?: boolean;
  locked?: boolean;
}

const chapters: { title: string; lessons: Lesson[] }[] = [
  {
    title: "Getting started",
    lessons: [
      { title: "Welcome", duration: "2 min", done: true },
      { title: "Set up your editor", duration: "8 min", done: true },
      { title: "Your first component", duration: "12 min", done: true },
    ],
  },
  {
    title: "State and effects",
    lessons: [
      { title: "Adding state", duration: "10 min", done: true },
      { title: "Derived state", duration: "9 min" },
      { title: "Effects", duration: "14 min" },
      { title: "Chapter quiz", duration: "5 min", locked: true },
    ],
  },
  {
    title: "Working with data",
    lessons: [
      { title: "Fetching data", duration: "11 min" },
      { title: "Forms", duration: "15 min" },
      { title: "Final project", duration: "30 min", locked: true },
    ],
  },
];

const lessons = chapters.flatMap((chapter) => chapter.lessons);
const doneCount = lessons.filter((lesson) => lesson.done).length;

function LessonSlot({ lesson }: { lesson: Lesson }) {
  // An icon-sized slot takes the same room as a slot one line tall, and the
  // matching margin keeps the label in line with the other lessons.
  if (lesson.locked) {
    return (
      <NavSlot $mx="xl">
        <Lock aria-label="Locked" />
      </NavSlot>
    );
  }
  // A marker fills a positioned slot one line tall. Only a done lesson adds its
  // state to the link name.
  return (
    <NavSlot $size="xl" className="relative">
      <ListItemMarker
        checked={!!lesson.done}
        aria-label={lesson.done ? "Done" : undefined}
        aria-hidden={!lesson.done || undefined}
      />
    </NavSlot>
  );
}

export default function Example() {
  const [current, setCurrent] = useState("Derived state");
  return (
    <Frame
      $layer
      $lighten={0.5}
      $rounded="2xl"
      $border
      $p={2}
      className="grid w-80 gap-3"
    >
      <div className="grid gap-2 px-2 pt-2">
        <span className="font-semibold">React for designers</span>
        <Progress
          value={doneCount / lessons.length}
          aria-label={`${doneCount} of ${lessons.length} lessons done`}
        />
      </div>
      {/* The halfway bar runs on the guide of the open chapter. */}
      <Nav aria-label="Lessons" bar={{ $offset: "halfway" }}>
        {chapters.map((chapter, index) => {
          const done = chapter.lessons.filter((lesson) => lesson.done);
          return (
            <NavDisclosure
              key={chapter.title}
              defaultOpen={chapter.lessons.some(
                (lesson) => lesson.title === current,
              )}
              button={
                <NavDisclosureButton
                  label={`${index + 1}. ${chapter.title}`}
                  description={`${done.length} of ${chapter.lessons.length} done`}
                >
                  {/* A marker fills a positioned slot one line tall. The
                      description already states the progress. */}
                  <NavSlot $size="xl" className="relative">
                    <ListItemMarker
                      progress={done.length / chapter.lessons.length}
                      aria-hidden
                    />
                  </NavSlot>
                </NavDisclosureButton>
              }
            >
              <NavList>
                {chapter.lessons.map((lesson) => (
                  <NavLink
                    key={lesson.title}
                    href={`#${lesson.title.toLowerCase().replaceAll(" ", "-")}`}
                    aria-current={current === lesson.title ? "page" : undefined}
                    onClick={(event: MouseEvent) => {
                      event.preventDefault();
                      setCurrent(lesson.title);
                    }}
                  >
                    <LessonSlot lesson={lesson} />
                    <NavLinkContent $orientation="horizontal">
                      <NavLinkLabel>{lesson.title}</NavLinkLabel>
                      <NavLinkDescription>{lesson.duration}</NavLinkDescription>
                    </NavLinkContent>
                  </NavLink>
                ))}
              </NavList>
            </NavDisclosure>
          );
        })}
      </Nav>
    </Frame>
  );
}
