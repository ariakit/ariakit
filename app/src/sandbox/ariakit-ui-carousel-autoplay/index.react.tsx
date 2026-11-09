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
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { useState } from "react";

// Autoplay shows each slide for 1 second here, instead of the default 5, so the
// tests don't wait long.
const DELAY = 1000;

const projects = ["Dashboard", "Mobile app", "Design system", "Billing"];

/**
 * Lazy slides whose readiness the checkboxes below the carousel set, like
 * images that load. Only the first slide starts ready, so autoplay holds on it
 * until the second one is ready.
 */
function ReadySection() {
  const [readyIds, setReadyIds] = useState(() => new Set(projects.slice(0, 1)));
  const setReady = (project: string, ready: boolean) => {
    setReadyIds((ids) => {
      const next = new Set(ids);
      if (ready) {
        next.add(project);
      } else {
        next.delete(project);
      }
      return next;
    });
  };
  return (
    <section aria-label="Ready" className="grid justify-items-start gap-3">
      <h2 className="text-sm font-medium">Ready</h2>
      <Carousel
        autoPlay
        autoPlayDelay={DELAY}
        aria-label="Projects"
        className="w-[28rem] max-w-full"
      >
        <CarouselViewport>
          {projects.map((project) => (
            <CarouselSlide key={project} lazy ready={readyIds.has(project)}>
              <Frame
                $layer="brand"
                $mix={20}
                $rounded="xl"
                $p={4}
                className="grid h-36 content-end gap-1 px-14"
              >
                <h3 className="font-medium">{project}</h3>
                <a href={`#${project}`} className="text-sm underline">
                  Open {project}
                </a>
              </Frame>
            </CarouselSlide>
          ))}
        </CarouselViewport>
        <CarouselTabList>
          {projects.map((project) => (
            <CarouselTab key={project} />
          ))}
        </CarouselTabList>
      </Carousel>
      <fieldset className="flex flex-wrap gap-4 text-sm">
        <legend className="mb-1 font-medium">Ready slides</legend>
        {projects.map((project) => (
          <label key={project} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={readyIds.has(project)}
              onChange={(event) => setReady(project, event.target.checked)}
            />
            {project}
          </label>
        ))}
      </fieldset>
    </section>
  );
}

// Four slides share the row, less the gaps between them.
const quarterSlide = "basis-[calc((100%-3*var(--carousel-gap))/4)]";
// A bit wider, so the row overflows by less than half a slide, and the same
// slides still show.
const almostQuarterSlide = "basis-[calc((100%-3*var(--carousel-gap))/4*1.1)]";

/**
 * Slides that hold iframes, which take hover, focus, and wheel input of their
 * own. One button hides the carousel, as a closed panel would, another fits
 * every slide in the row, as a wide screen would, and a third leaves the row
 * just too narrow for them.
 */
function FrameSection() {
  const [hidden, setHidden] = useState(false);
  const [fit, setFit] = useState<"none" | "all" | "almost">("none");
  return (
    <section aria-label="Frames" className="grid justify-items-start gap-3">
      <h2 className="text-sm font-medium">Frames</h2>
      <div className="flex gap-2">
        <Button $kind="bevel" onClick={() => setHidden((hidden) => !hidden)}>
          {hidden ? "Show previews" : "Hide previews"}
        </Button>
        <Button
          $kind="bevel"
          onClick={() => setFit((fit) => (fit === "all" ? "none" : "all"))}
        >
          {fit === "all" ? "Show one preview" : "Fit all previews"}
        </Button>
        <Button $kind="bevel" onClick={() => setFit("almost")}>
          Almost fit all previews
        </Button>
      </div>
      <div hidden={hidden} className="w-[28rem] max-w-full">
        <Carousel autoPlay autoPlayDelay={DELAY} aria-label="Previews">
          <CarouselViewport>
            {projects.map((project) => (
              <CarouselSlide
                key={project}
                className={
                  fit === "all"
                    ? quarterSlide
                    : fit === "almost"
                      ? almostQuarterSlide
                      : undefined
                }
              >
                <iframe
                  title={`${project} preview`}
                  srcDoc={`<!doctype html><body style="font:14px system-ui"><h3>${project}</h3><button>Edit ${project}</button></body>`}
                  className="h-36 w-full rounded-xl border px-12"
                />
              </CarouselSlide>
            ))}
          </CarouselViewport>
          <CarouselTabList>
            {projects.map((project) => (
              <CarouselTab key={project} />
            ))}
          </CarouselTabList>
        </Carousel>
      </div>
    </section>
  );
}

const people = ["Kai", "Noor", "Lena", "Tomas", "Ines"];

// Two slides share the row, less the gap between them.
const halfSlide = "basis-[calc((100%-var(--carousel-gap))/2)]";

/**
 * Two slides per view, so the last view starts before the last slide. The
 * checkbox turns autoplay off and on, as an app can while the carousel stays.
 */
function SeveralSection() {
  const [autoPlay, setAutoPlay] = useState(true);
  return (
    <section aria-label="Several" className="grid justify-items-start gap-3">
      <h2 className="text-sm font-medium">Several</h2>
      <Carousel
        autoPlay={autoPlay}
        autoPlayDelay={DELAY}
        aria-label="People"
        className="w-[28rem] max-w-full"
      >
        <CarouselViewport>
          {people.map((person) => (
            <CarouselSlide key={person} className={halfSlide}>
              <Frame
                $layer="brand"
                $mix={20}
                $rounded="xl"
                $p={4}
                className="grid h-32 content-end"
              >
                <h3 className="font-medium">{person}</h3>
              </Frame>
            </CarouselSlide>
          ))}
        </CarouselViewport>
        <CarouselTabList>
          {people.map((person) => (
            <CarouselTab key={person} />
          ))}
        </CarouselTabList>
      </Carousel>
      <label className="flex items-center gap-1 text-sm">
        <input
          type="checkbox"
          checked={autoPlay}
          onChange={(event) => setAutoPlay(event.target.checked)}
        />
        Autoplay
      </label>
    </section>
  );
}

const places = ["Lisbon", "Kyoto", "Lima", "Oslo", "Accra"];

/**
 * Two slides per view without snapping, so a scroll can stop anywhere, such as
 * just before a slide.
 */
function FreeSection() {
  return (
    <section aria-label="Free" className="grid justify-items-start gap-3">
      <h2 className="text-sm font-medium">Free</h2>
      <Carousel
        autoPlay
        autoPlayDelay={DELAY}
        aria-label="Places"
        className="w-[28rem] max-w-full"
      >
        <CarouselViewport $snap="none">
          {places.map((place) => (
            <CarouselSlide key={place} className={halfSlide}>
              <Frame
                $layer="brand"
                $mix={20}
                $rounded="xl"
                $p={4}
                className="grid h-32 content-end"
              >
                <h3 className="font-medium">{place}</h3>
              </Frame>
            </CarouselSlide>
          ))}
        </CarouselViewport>
        <CarouselTabList>
          {places.map((place) => (
            <CarouselTab key={place} />
          ))}
        </CarouselTabList>
      </Carousel>
    </section>
  );
}

const tags = ["Design", "Code", "Docs"];

/**
 * Lazy slides in a row, which doesn't track the slides that show, so they
 * render their content at once.
 */
function RowSection() {
  return (
    <section aria-label="Row" className="grid justify-items-start gap-3">
      <h2 className="text-sm font-medium">Row</h2>
      <Carousel $kind="row" className="w-[28rem] max-w-full">
        <CarouselViewport aria-label="Tags" render={<div role="group" />}>
          {tags.map((tag) => (
            <CarouselSlide key={tag} lazy className="basis-48">
              <Frame $layer $border $rounded="lg" $p={3}>
                <h3 className="font-medium">{tag}</h3>
              </Frame>
            </CarouselSlide>
          ))}
        </CarouselViewport>
      </Carousel>
    </section>
  );
}

export default function Example() {
  return (
    <div className="grid gap-12 p-12">
      <ReadySection />
      <FrameSection />
      <SeveralSection />
      <FreeSection />
      <RowSection />
      {/* Focus can leave the carousels for a button outside them. */}
      <Button className="justify-self-start">Outside</Button>
    </div>
  );
}
