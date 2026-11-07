import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  Carousel,
  CarouselSlide,
  CarouselTab,
  CarouselTabList,
  CarouselViewport,
} from "@ariakit/ui/components/carousel.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";

const templates = [
  { title: "Kanban board", text: "Columns for each stage of the work." },
  { title: "Sprint planning", text: "Goals, capacity, and the backlog." },
  { title: "Bug tracker", text: "Severity, owner, and steps to reproduce." },
  { title: "Release notes", text: "What changed, grouped by area." },
  { title: "Meeting notes", text: "Agenda, decisions, and action items." },
  { title: "Roadmap", text: "Quarters, themes, and milestones." },
  { title: "Retrospective", text: "What went well and what to change." },
];

// One, two, or three slides share the row as it grows, less the gaps between
// them.
const slideWidth =
  "@lg/templates:basis-[calc((100%-var(--carousel-gap))/2)] @3xl/templates:basis-[calc((100%-2*var(--carousel-gap))/3)]";

export default function Example() {
  return (
    <div className="@container/templates w-[52rem] max-w-full">
      {/* The bleed keeps room for the card borders, which a light surface
          draws as rings outside the cards. */}
      <Carousel aria-label="Templates" $bleed={1}>
        {/* With fades, each page shows whole cards between the buttons, and
            the cards beside it fade at the ends. */}
        <CarouselViewport $fade>
          {templates.map((template) => (
            <CarouselSlide key={template.title} className={slideWidth}>
              <Frame
                $layer
                $border
                $rounded="xl"
                $p={4}
                className="grid h-full content-between gap-3"
              >
                <div className="grid gap-1">
                  <p className="font-medium">{template.title}</p>
                  <p className="ak-ink-80 text-sm">{template.text}</p>
                </div>
                <Button $layer $border className="justify-self-start">
                  Use template
                </Button>
              </Frame>
            </CarouselSlide>
          ))}
        </CarouselViewport>
        <CarouselTabList>
          {templates.map((template) => (
            <CarouselTab key={template.title} />
          ))}
        </CarouselTabList>
      </Carousel>
    </div>
  );
}
