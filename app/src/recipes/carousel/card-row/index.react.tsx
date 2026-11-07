import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  Carousel,
  CarouselViewport,
} from "@ariakit/ui/components/carousel.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";

const integrations = [
  { name: "Calendar", text: "Show due dates next to your meetings." },
  { name: "Chat", text: "Post a message when a task changes." },
  { name: "Storage", text: "Attach files without leaving the board." },
  { name: "Email", text: "Turn a message into a task." },
  { name: "Analytics", text: "Count tasks closed each week." },
  { name: "Billing", text: "Link invoices to the work they pay for." },
];

export default function Example() {
  return (
    <Carousel $kind="row" className="w-[34rem] max-w-full">
      {/* Each step moves to the next card, and a swipe settles near one. */}
      <CarouselViewport
        aria-label="Integrations"
        render={<ul />}
        $step="item"
        $snap="proximity"
      >
        {integrations.map((integration) => (
          <li key={integration.name} className="shrink-0 snap-start">
            <Frame
              $layer
              $border
              $rounded="xl"
              $p={4}
              className="grid h-full w-52 content-between gap-3"
            >
              <div className="grid gap-1">
                <p className="font-medium">{integration.name}</p>
                <p className="ak-ink-80 text-sm">{integration.text}</p>
              </div>
              <Button $layer $border className="justify-self-start">
                Connect
              </Button>
            </Frame>
          </li>
        ))}
      </CarouselViewport>
    </Carousel>
  );
}
