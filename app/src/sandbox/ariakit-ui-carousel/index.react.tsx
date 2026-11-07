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
  Carousel,
  CarouselSlide,
  CarouselTab,
  CarouselTabList,
  CarouselViewport,
} from "@ariakit/ui/components/carousel.ariakit.react";
import type {
  CarouselProps,
  CarouselViewportProps,
} from "@ariakit/ui/components/carousel.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Tab,
  TabLabel,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

const filters = [
  "All",
  "Design",
  "Engineering",
  "Accessibility",
  "Performance",
  "Release notes",
  "Testing",
  "Documentation",
  "Community",
  "Security",
  "Internationalization",
  "Tooling",
];

const projects = [
  { title: "Dashboard", text: "Charts and tables for the weekly report." },
  { title: "Mobile app", text: "Offline mode and push notifications." },
  { title: "Design system", text: "Tokens, components, and guidelines." },
  { title: "Billing", text: "Invoices, receipts, and plan changes." },
  { title: "Search", text: "Typo tolerance and ranking rules." },
  { title: "Onboarding", text: "Checklists for the first week." },
  { title: "Analytics", text: "Funnels and retention cohorts." },
];

interface FilterRowProps extends Omit<CarouselProps, "children" | "recipe"> {
  label: string;
  viewport?: CarouselViewportProps;
  count?: number;
  /** Makes each filter half as wide as the row, through a class. */
  wide?: boolean;
}

function FilterRow({ label, viewport, count, wide, ...props }: FilterRowProps) {
  const items = count == null ? filters : filters.slice(0, count);
  return (
    <Carousel $kind="row" {...props}>
      <CarouselViewport
        aria-label={label}
        render={<div role="toolbar" />}
        {...viewport}
      >
        {items.map((filter) => (
          <Button
            key={filter}
            $layer
            $border
            className={wide ? "shrink-0 basis-1/2" : "shrink-0"}
          >
            {filter}
          </Button>
        ))}
      </CarouselViewport>
    </Carousel>
  );
}

interface ProjectCarouselProps extends Omit<
  CarouselProps,
  "children" | "recipe"
> {
  count?: number;
  /** Gives each slide an id, such as `start-billing`, from this prefix. */
  idPrefix?: string;
  /** Classes for each slide, such as a basis for several slides per view. */
  slideClassName?: string;
}

// Two or three slides share the row, less the gaps between them.
const halfSlide = "basis-[calc((100%-var(--carousel-gap))/2)]";
const thirdSlide = "basis-[calc((100%-2*var(--carousel-gap))/3)]";

/** The id of a project slide, such as `start-billing`. */
function getSlideId(prefix: string, title: string) {
  return `${prefix}-${title.toLowerCase().replace(/ /g, "-")}`;
}

function ProjectCarousel({
  count,
  idPrefix,
  slideClassName,
  ...props
}: ProjectCarouselProps) {
  const items = count == null ? projects : projects.slice(0, count);
  return (
    <Carousel {...props}>
      <CarouselViewport>
        {items.map((project) => (
          <CarouselSlide
            key={project.title}
            id={idPrefix ? getSlideId(idPrefix, project.title) : undefined}
            className={slideClassName}
          >
            <Frame
              $layer="brand"
              $mix={20}
              $rounded="xl"
              $p={4}
              className="grid h-36 content-end gap-1"
            >
              <h3 className="font-medium">{project.title}</h3>
              <p className="text-sm">{project.text}</p>
            </Frame>
          </CarouselSlide>
        ))}
      </CarouselViewport>
      <CarouselTabList>
        {items.map((project) => (
          <CarouselTab key={project.title} />
        ))}
      </CarouselTabList>
    </Carousel>
  );
}

function SelectedSlide() {
  const [selectedId, setSelectedId] = useState(
    getSlideId("selected", "Billing"),
  );
  const project = projects.find(
    (project) => getSlideId("selected", project.title) === selectedId,
  );
  return (
    <div className="grid w-full gap-3">
      <ProjectCarousel
        aria-label="Selected projects"
        idPrefix="selected"
        selectedId={selectedId}
        setSelectedId={setSelectedId}
      />
      <p>Selected project: {project?.title}</p>
      <Button
        $layer
        $border
        className="justify-self-start"
        onClick={() => setSelectedId(getSlideId("selected", "Search"))}
      >
        Show Search
      </Button>
    </div>
  );
}

/**
 * A controlled carousel in a tab panel that isn't selected at first, so it
 * mounts hidden and shows when the person picks its tab.
 */
function TabbedSlides() {
  const [selectedId, setSelectedId] = useState(getSlideId("tabbed", "Billing"));
  const project = projects.find(
    (project) => getSlideId("tabbed", project.title) === selectedId,
  );
  return (
    <div className="grid w-full gap-3">
      <Tabs defaultSelectedId="tabbed-details">
        <TabList aria-label="Project views">
          <Tab id="tabbed-details">
            <TabLabel>Details</TabLabel>
          </Tab>
          <Tab id="tabbed-slides">
            <TabLabel>Slides</TabLabel>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel tabId="tabbed-details">
            <p className="text-sm">The project slides are in the next tab.</p>
          </TabPanel>
          <TabPanel tabId="tabbed-slides">
            <ProjectCarousel
              aria-label="Projects in a tab"
              idPrefix="tabbed"
              selectedId={selectedId}
              setSelectedId={setSelectedId}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <p>Selected project: {project?.title}</p>
    </div>
  );
}

/**
 * A row of cards that steps by item, with a row of filters of the default step
 * in its first card.
 */
function NestedRows() {
  return (
    <Carousel $kind="row">
      <CarouselViewport
        aria-label="Cards"
        render={<div role="group" />}
        $step="item"
      >
        <Frame $layer $border $rounded="lg" $p={2} className="w-72 shrink-0">
          <FilterRow label="Card filters" />
        </Frame>
        {projects.map((project) => (
          <Frame
            key={project.title}
            $layer
            $border
            $rounded="lg"
            $p={3}
            className="w-48 shrink-0"
          >
            {project.title}
          </Frame>
        ))}
      </CarouselViewport>
    </Carousel>
  );
}

function GrowingRow() {
  const [count, setCount] = useState(3);
  const [wide, setWide] = useState(false);
  return (
    <div className="grid w-full gap-3">
      <FilterRow label="Growing filters" count={count} wide={wide} />
      <div className="flex flex-wrap gap-2">
        <Button $layer $border onClick={() => setCount(filters.length)}>
          Show all filters
        </Button>
        <Button $layer $border onClick={() => setWide(true)}>
          Widen filters
        </Button>
      </div>
    </div>
  );
}

/**
 * Renders a filter row into a same-origin iframe with the styles of the page,
 * as an app does when it renders a preview pane through a portal.
 */
function FramedRow() {
  const [body, setBody] = useState<HTMLElement | null>(null);
  const ref = useCallback((iframe: HTMLIFrameElement | null) => {
    const frameDocument = iframe?.contentDocument;
    if (!frameDocument) {
      setBody(null);
      return;
    }
    const styles = document.querySelectorAll("style, link[rel='stylesheet']");
    for (const style of styles) {
      frameDocument.head.append(style.cloneNode(true));
    }
    setBody(frameDocument.body);
  }, []);
  return (
    <>
      <iframe ref={ref} title="Framed filters" className="h-24 w-full" />
      {body && createPortal(<FilterRow label="Framed filters" />, body)}
    </>
  );
}

export default function CarouselExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Filter row"
        description="A row of chips that scrolls freely. The ends fade while more chips lie that way, and buttons show with a fine pointer."
        code={`
          <Carousel $kind="row">
            <CarouselViewport aria-label="Filters" render={<div role="toolbar" />}>
              <Button>All</Button>
            </CarouselViewport>
          </Carousel>
        `}
        stretch
      >
        <FilterRow label="Filters" />
      </Example>

      <Example
        title="Row steps"
        description="Buttons scroll to the next item."
        code={`<CarouselViewport $step="item" />`}
        stretch
      >
        <FilterRow label="Filters by item" viewport={{ $step: "item" }} />
      </Example>

      <Example
        title="Nested rows"
        description="A row of cards that steps by item holds a row of filters, which keeps the view step."
        code={`<CarouselViewport $step="item"><Card><CarouselViewport /></Card></CarouselViewport>`}
        stretch
      >
        <NestedRows />
      </Example>

      <Example
        title="Row without fades"
        description="The buttons cover the chips, and nothing fades."
        code={`<CarouselViewport $fade={false} />`}
        stretch
      >
        <FilterRow label="Filters without fades" viewport={{ $fade: false }} />
      </Example>

      <Example
        title="Row without buttons"
        description="Only the fades show where more chips lie."
        code={`<Carousel $kind="row" buttons={false} />`}
        stretch
      >
        <FilterRow label="Filters without buttons" buttons={false} />
      </Example>

      <Example
        title="Right to left row"
        description="The fades, the buttons, and the chevrons follow the writing direction."
        code={`<Carousel $kind="row" dir="rtl" />`}
        stretch
      >
        <FilterRow label="Filters right to left" dir="rtl" />
      </Example>

      <Example
        title="Growing row"
        description="The end button shows once added or wider items overflow the row."
        code={`<CarouselViewport>{items}</CarouselViewport>`}
        stretch
      >
        <GrowingRow />
      </Example>

      <Example
        title="Row in a frame"
        description="A row that renders into a same-origin iframe through a portal, where its buttons read the focus of the iframe document."
        code={`createPortal(<Carousel $kind="row" />, iframe.contentDocument.body)`}
        stretch
      >
        <FramedRow />
      </Example>

      <Example
        title="Slides"
        description="A classic carousel with one slide per view, buttons on every device, and slide tabs."
        code={`
          <Carousel aria-label="Projects">
            <CarouselViewport>
              <CarouselSlide>Dashboard</CarouselSlide>
            </CarouselViewport>
            <CarouselTabList>
              <CarouselTab />
            </CarouselTabList>
          </Carousel>
        `}
        stretch
      >
        <ProjectCarousel aria-label="Projects" />
      </Example>

      <Example
        title="Right to left slides"
        description="The buttons, the slide tabs, and the arrow keys follow the writing direction."
        code={`<Carousel aria-label="Projects" dir="rtl" />`}
        stretch
      >
        <ProjectCarousel aria-label="Projects right to left" dir="rtl" />
      </Example>

      <Example
        title="Selected slide"
        description="selectedId and setSelectedId follow the slide that shows. The carousel starts at the selected slide and scrolls to a slide that the page selects."
        code={`<Carousel selectedId={selectedId} setSelectedId={setSelectedId} />`}
        stretch
      >
        <SelectedSlide />
      </Example>

      <Example
        title="Default slide"
        description="defaultSelectedId starts the carousel at a later slide, without a visible scroll."
        code={`<Carousel defaultSelectedId="start-billing" />`}
        stretch
      >
        <ProjectCarousel
          aria-label="Projects from Billing"
          idPrefix="start"
          defaultSelectedId={getSlideId("start", "Billing")}
        />
      </Example>

      <Example
        title="Slides in a tab panel"
        description="A controlled carousel in a tab panel that isn't selected at first. It shows the selected slide once its tab is picked, and keeps the selection while hidden."
        code={`<TabPanel><Carousel selectedId={selectedId} setSelectedId={setSelectedId} /></TabPanel>`}
        stretch
      >
        <TabbedSlides />
      </Example>

      <Example
        title="Slides per view"
        description="Three slides share the row. Every slide snaps and has its own tab, and the buttons move one slide at a time."
        code={`<CarouselSlide className="basis-[calc((100%-2*var(--carousel-gap))/3)]" />`}
        wide
        stretch
      >
        <ProjectCarousel
          aria-label="Projects in thirds"
          slideClassName={thirdSlide}
        />
      </Example>

      <Example
        title="Slides that fit"
        description="Three slides fill the row, so it doesn't scroll, and the tabs still select each slide."
        code={`<Carousel>{threeSlidesInThirds}</Carousel>`}
        wide
        stretch
      >
        <ProjectCarousel
          aria-label="Projects that fit"
          count={3}
          slideClassName={thirdSlide}
        />
      </Example>

      <Example
        title="Responsive slides"
        description="Container queries on a parent change the basis of the slides with the width."
        code={`<CarouselSlide className="@xl/projects:basis-[…] @4xl/projects:basis-[…]" />`}
        wide
        stretch
      >
        <div className="@container/projects w-full">
          <ProjectCarousel
            aria-label="Responsive projects"
            slideClassName="@xl/projects:basis-[calc((100%-var(--carousel-gap))/2)] @4xl/projects:basis-[calc((100%-2*var(--carousel-gap))/3)]"
          />
        </div>
      </Example>

      <Example
        title="Slides with fades"
        description="Two slides per view with fades. The fade ends before the buttons."
        code={`<CarouselViewport $fade><CarouselSlide className="basis-[…]" /></CarouselViewport>`}
        wide
        stretch
      >
        <Carousel aria-label="Projects with fades">
          <CarouselViewport $fade>
            {projects.map((project) => (
              <CarouselSlide key={project.title} className={halfSlide}>
                <Frame
                  $layer="brand"
                  $mix={20}
                  $rounded="xl"
                  $p={4}
                  className="grid h-36 content-end gap-1"
                >
                  <h3 className="font-medium">{project.title}</h3>
                  <p className="text-sm">{project.text}</p>
                </Frame>
              </CarouselSlide>
            ))}
          </CarouselViewport>
          <CarouselTabList>
            {projects.map((project) => (
              <CarouselTab key={project.title} />
            ))}
          </CarouselTabList>
        </Carousel>
      </Example>
    </ExampleGrid>
  );
}
