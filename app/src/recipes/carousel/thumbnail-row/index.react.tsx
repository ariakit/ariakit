import {
  Carousel,
  CarouselViewport,
} from "@ariakit/ui/components/carousel.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";

const episodes = [
  { id: "harbor", title: "The Harbor", hue: 220 },
  { id: "orchard", title: "The Orchard", hue: 130 },
  { id: "glacier", title: "The Glacier", hue: 190 },
  { id: "canyon", title: "The Canyon", hue: 30 },
  { id: "market", title: "The Market", hue: 330 },
  { id: "lighthouse", title: "The Lighthouse", hue: 260 },
  { id: "dunes", title: "The Dunes", hue: 60 },
  { id: "forest", title: "The Forest", hue: 150 },
];

export default function Example() {
  return (
    <section
      aria-labelledby="continue-watching"
      className="grid w-[40rem] max-w-full gap-2"
    >
      <h2 id="continue-watching" className="font-medium">
        Continue watching
      </h2>
      {/* The bleed leaves room around a thumbnail that grows, and the buttons
          center on the thumbnails, below that room, not on their titles. */}
      <Carousel $kind="row" $bleed={3} $buttonCenter="calc(11em * 9 / 32)">
        <CarouselViewport aria-labelledby="continue-watching" render={<ul />}>
          {episodes.map((episode, index) => (
            <li key={episode.id} className="shrink-0">
              <a
                href={`#${episode.id}`}
                className="group grid w-44 gap-1.5 rounded-lg outline-offset-2"
              >
                <Frame
                  $layer="brand"
                  $hue={episode.hue}
                  $rounded="lg"
                  className="grid aspect-video place-items-center text-sm font-medium transition-transform group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none"
                >
                  Episode {index + 1}
                </Frame>
                <span className="text-sm">{episode.title}</span>
              </a>
            </li>
          ))}
        </CarouselViewport>
      </Carousel>
    </section>
  );
}
