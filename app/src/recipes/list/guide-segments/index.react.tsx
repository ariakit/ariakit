import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";

const stops = [
  { time: "08:02", name: "Harbor Square" },
  { time: "08:09", name: "Old Mill" },
  { time: "08:15", name: "Museum" },
  { time: "08:21", name: "Botanic Garden" },
  { time: "08:34", name: "Airport" },
];

// The train is at this stop.
const currentIndex = 2;

export default function Example() {
  return (
    // The guide prop turns the guide on and sets its color. The bullets take
    // the color of their guide.
    <List guide={{ $edge: "success" }} className="w-72 max-w-full">
      {stops.map((stop, index) => {
        const current = index === currentIndex;
        return (
          <ListItem
            key={stop.name}
            aria-current={current ? "step" : undefined}
            // The piece of a row runs from its marker to the next marker. A row
            // sets its own guide props, so the part of the route that is still
            // to come is dashed.
            guide={
              index >= currentIndex
                ? { $edge: "success", $line: "dashed" }
                : undefined
            }
            $ink={index < currentIndex ? 60 : undefined}
            className={current ? "font-medium" : undefined}
          >
            <span className="flex items-baseline gap-3">
              <time className="ak-ink-60 text-sm tabular-nums">
                {stop.time}
              </time>
              {stop.name}
            </span>
          </ListItem>
        );
      })}
    </List>
  );
}
