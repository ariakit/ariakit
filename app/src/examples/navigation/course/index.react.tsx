import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  List,
  ListDisclosure,
  ListDisclosureButton,
  ListItemMarker,
} from "@ariakit/ui/components/list.ariakit.react";
import {
  Nav,
  NavDisclosureContentBody,
  NavLinkDescription,
  NavLinkLabel,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { Progress } from "@ariakit/ui/components/progress.ariakit.react";
import { Lock } from "lucide-react";
import { useLocation } from "react-router";
import { ExampleRouter, RouterNavLink } from "../router.react.tsx";

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
      {
        title: "Synchronizing effects with external systems",
        duration: "14 min",
      },
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

function getPath(title: string) {
  return `/${title.toLowerCase().replaceAll(" ", "-")}`;
}

function LessonSlot({ lesson }: { lesson: Lesson }) {
  // An icon-sized slot takes the same room as a slot one line tall. Both close
  // the label gap, so the labels stay in line with each other.
  if (lesson.locked) {
    return (
      <NavSlot $mx="closeGap">
        <Lock aria-label="Locked" />
      </NavSlot>
    );
  }
  // A marker fills a positioned slot one line tall. Only a done lesson adds its
  // state to the link name.
  return (
    <NavSlot $size="xl" $mx="closeGap" className="relative">
      <ListItemMarker
        checked={!!lesson.done}
        aria-label={lesson.done ? "Done" : undefined}
        aria-hidden={!lesson.done || undefined}
      />
    </NavSlot>
  );
}

function Course() {
  const { pathname } = useLocation();
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
      {/* The ordered list numbers the chapters and joins their markers with a
          guide. The halfway bar of the current lesson runs on that guide. The
          bar name lets the router's view transitions move the bar between
          lessons. */}
      <Nav
        aria-label="Lessons"
        list={<List ordered />}
        bar={{ $offset: "halfway", $length: "full" }}
        className="[--bar-transition-name:lessons-bar]"
      >
        {chapters.map((chapter) => {
          const done = chapter.lessons.filter((lesson) => lesson.done);
          return (
            <li key={chapter.title}>
              <ListDisclosure
                defaultOpen={chapter.lessons.some(
                  (lesson) => pathname === getPath(lesson.title),
                )}
                button={
                  <ListDisclosureButton
                    progress={done.length / chapter.lessons.length}
                    description={`${done.length} of ${chapter.lessons.length} done`}
                    indicator="chevron-right-end"
                  >
                    {chapter.title}
                  </ListDisclosureButton>
                }
                // The nav body spaces and aligns the lessons like the rows of a
                // nav disclosure.
                content={{ body: <NavDisclosureContentBody /> }}
              >
                <NavList>
                  {chapter.lessons.map((lesson) => (
                    <RouterNavLink
                      key={lesson.title}
                      $size="sm"
                      to={getPath(lesson.title)}
                    >
                      <LessonSlot lesson={lesson} />
                      <NavLinkLabel>{lesson.title}</NavLinkLabel>
                      {/* A text slot keeps the duration at the end of the first
                          line, with the side padding of the label. */}
                      <NavSlot $kind="text">
                        <NavLinkDescription>
                          {lesson.duration}
                        </NavLinkDescription>
                      </NavSlot>
                    </RouterNavLink>
                  ))}
                </NavList>
              </ListDisclosure>
            </li>
          );
        })}
      </Nav>
    </Frame>
  );
}

export default function Example() {
  return (
    <ExampleRouter initialPath={getPath("Derived state")}>
      <Course />
    </ExampleRouter>
  );
}
