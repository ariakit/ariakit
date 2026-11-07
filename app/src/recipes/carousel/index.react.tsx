import {
  Carousel,
  CarouselSlide,
  CarouselTab,
  CarouselTabList,
  CarouselViewport,
} from "@ariakit/ui/components/carousel.ariakit.react";
import type { CarouselButtonProps } from "@ariakit/ui/components/carousel.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { useState } from "react";

const tips = [
  {
    id: "tip-plan",
    hue: "blue",
    title: "Plan the week",
    text: "Sort tasks by due date and pin the three that matter most.",
  },
  {
    id: "tip-share",
    hue: "cyan",
    title: "Share a board",
    text: "Invite a teammate by email and choose what they can change.",
  },
  {
    id: "tip-track",
    hue: "green",
    title: "Track progress",
    text: "Move a card to Done, and the chart counts it for this sprint.",
  },
  {
    id: "tip-catch-up",
    hue: "orange",
    title: "Catch up later",
    text: "Mark a thread as unread to keep it at the top of your inbox.",
  },
  {
    id: "tip-offline",
    hue: "magenta",
    title: "Work offline",
    text: "Changes you make on a plane sync when you are back online.",
  },
] as const;

export default function Example() {
  const [selectedId, setSelectedId] = useState<string>(tips[0].id);
  const tip = tips.find((tip) => tip.id === selectedId) ?? tips[0];
  // The buttons sit beside the slides, so they take the color of the tip that
  // shows from the selected slide.
  const button: CarouselButtonProps = { $layer: "brand", $hue: tip.hue };
  return (
    <Carousel
      aria-label="Tips"
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      previousButton={button}
      nextButton={button}
      className="w-[28rem] max-w-full"
    >
      <CarouselViewport>
        {tips.map((tip) => (
          <CarouselSlide key={tip.id} id={tip.id}>
            <Frame
              $layer="brand"
              $hue={tip.hue}
              $rounded="xl"
              $p={5}
              // The buttons overlay the slide, so the text keeps clear of them.
              className="grid h-44 content-end gap-1 px-14"
            >
              <p className="text-lg font-medium">{tip.title}</p>
              <p>{tip.text}</p>
            </Frame>
          </CarouselSlide>
        ))}
      </CarouselViewport>
      <CarouselTabList>
        {tips.map((tip) => (
          <CarouselTab key={tip.id} />
        ))}
      </CarouselTabList>
    </Carousel>
  );
}
