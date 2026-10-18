import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Button,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import {
  Nav,
  NavGroup,
  NavGroupLabel,
  NavLink,
  NavList,
} from "@ariakit/ui/components/nav.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellHeader,
  ShellFooter,
  ShellFooterEnd,
  ShellSidebar,
  ShellSidebarBody,
  ShellMain,
  ShellMainIntro,
  ShellMainBody,
  ShellMainPopout,
  ShellMainFeature,
} from "@ariakit/ui/components/shell.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import { BookOpen, Calendar, CircleUser, Hexagon } from "lucide-react";
import { useState } from "react";

export default function Example() {
  const [readingMode, setReadingMode] = useState(false);
  return (
    <Shell>
      <ShellHeader
        $blur
        $border={false}
        start={
          <a href="#" className="flex items-center gap-2 font-semibold">
            <Hexagon strokeWidth={1.5} className="size-5" /> Field Notes
          </a>
        }
        end={
          <Button
            aria-label="Reading mode"
            aria-pressed={readingMode}
            $layer={readingMode ? true : "transparent"}
            onClick={() => setReadingMode((value) => !value)}
          >
            <ButtonSlot>
              <BookOpen />
            </ButtonSlot>
          </Button>
        }
      />
      <ShellMain $maxWidth="40rem">
        <ShellMainIntro $gap={4}>
          <Badge className="w-fit">
            <BadgeLabel>Engineering</BadgeLabel>
          </Badge>
          <Heading className="text-4xl tracking-tight text-balance">
            Designing calm interfaces for long reads
          </Heading>
          <p className="ak-ink-70 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <CircleUser className="size-4" /> Maya Chen
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" /> October 12, 2026
            </span>
            <span>6 min read</span>
          </p>
        </ShellMainIntro>
        <ShellMainBody>
          <HeadingLevel level={2}>
            <Prose className={readingMode ? "text-lg leading-8" : undefined}>
              <p>{articleParagraphs[0]}</p>
              <Heading id="why-calm">Why calm matters</Heading>
              <p>{articleParagraphs[1]}</p>
              <Heading id="measure">Set the measure first</Heading>
              <p>{articleParagraphs[2]}</p>
            </Prose>
            <ShellMainFeature render={<figure />}>
              <Frame
                $layer="brand"
                $hue="blue"
                $chroma="vivid"
                $rounded="xl"
                className="aspect-[16/9]"
              />
              <figcaption className="ak-ink-70 mt-3 text-center">
                Light falls across a 40rem reading column.
              </figcaption>
            </ShellMainFeature>
            <Prose className={readingMode ? "text-lg leading-8" : undefined}>
              <Heading id="contrast">Contrast without noise</Heading>
              <p>{articleParagraphs[3]}</p>
              <Heading id="motion">Motion that waits for you</Heading>
              <p>{articleParagraphs[4]}</p>
            </Prose>
            <ShellMainPopout>
              <Text
                $text="brand"
                render={<blockquote />}
                className="block text-balance border-l-2 py-1 pl-6 text-2xl font-medium italic"
              >
                "Good reading design gets out of the way and lets the words do
                the work."
              </Text>
            </ShellMainPopout>
            <Prose className={readingMode ? "text-lg leading-8" : undefined}>
              <Heading id="keep-reading">Keep reading</Heading>
            </Prose>
            <div className="grid gap-4 @2xl/shell-main-body:grid-cols-2">
              {relatedPosts.map((post) => (
                <Frame key={post.title} $rounded="xl" $p={4} $border>
                  <p className="ak-ink-70 text-sm">
                    {post.category} · {post.minutes} min read
                  </p>
                  <a href="#" className="font-semibold">
                    {post.title}
                  </a>
                </Frame>
              ))}
            </div>
          </HeadingLevel>
        </ShellMainBody>
      </ShellMain>
      <ShellSidebar
        $side="end"
        $width="sm"
        $from="body"
        $border={false}
        $layer="transparent"
        $show="5xl"
        aria-label="On this page"
        render={<nav />}
      >
        <ShellSidebarBody>
          <Nav render={<div />} list={false}>
            <NavGroup>
              <NavGroupLabel>On this page</NavGroupLabel>
              <NavList>
                {sections.map((section) => (
                  <NavLink key={section.id} href={`#${section.id}`}>
                    {section.label}
                  </NavLink>
                ))}
              </NavList>
            </NavGroup>
          </Nav>
        </ShellSidebarBody>
      </ShellSidebar>
      <ShellFooter
        $border={false}
        start={<p className="ak-ink-70">© 2026 Field Notes</p>}
        end={
          <ShellFooterEnd $shrink>
            {/* Demo form: the submit handler only keeps the page in place. */}
            <form
              className="flex w-full max-w-sm gap-2"
              onSubmit={(event) => event.preventDefault()}
            >
              <Input
                type="email"
                aria-label="Email address"
                placeholder="you@example.com"
                className="min-w-0 flex-1"
                required
              />
              <Button type="submit" $layer="brand" $kind="bevel">
                Subscribe
              </Button>
            </form>
          </ShellFooterEnd>
        }
      />
    </Shell>
  );
}

const sections = [
  { id: "why-calm", label: "Why calm matters" },
  { id: "measure", label: "Set the measure first" },
  { id: "contrast", label: "Contrast without noise" },
  { id: "motion", label: "Motion that waits for you" },
  { id: "keep-reading", label: "Keep reading" },
];

const relatedPosts = [
  { title: "Typesetting for the web", category: "Design", minutes: 4 },
  { title: "Notes on keyboard focus", category: "Accessibility", minutes: 7 },
  { title: "Why we ship fewer tokens", category: "Systems", minutes: 5 },
  { title: "Dark mode without surprises", category: "Color", minutes: 6 },
];

const articleParagraphs = [
  "Most interfaces compete for attention. A reading screen should do the opposite. When the chrome is quiet, the eye stays on the sentence, and the page feels like a page instead of a dashboard.",
  "Calm does not mean empty. It means every element earns its place. A header that blurs over the text, a footer that does not draw a line, and a sidebar that appears only when the screen is wide enough to hold it.",
  "A line of text should fit about seventy characters. Narrower columns make the reader turn lines too often, and wider columns make it hard to find the start of the next one. Start with the width, then choose the type size and the leading.",
  "Contrast is a tool, not a decoration. Body text needs strong contrast against the page. Secondary labels can step back a little, but never so far that they disappear for readers in bright rooms or on cheap screens.",
  "Motion should respond to a request, not announce itself. Scrolling should land on a heading without a bounce, and the table of contents should follow the reader without flickering. When in doubt, remove the animation and check the page again.",
];
