import * as React from "react";
import { useCompositeState, Composite, CompositeItem } from "reakit/Composite";

type Props<T = any> = React.HTMLAttributes<T> & {
  setEvents: React.Dispatch<React.SetStateAction<string[]>>;
};

function mergeEvent<
  E extends React.SyntheticEvent,
  T extends React.EventHandler<E>
>(handler: T, htmlHandler?: T) {
  return (event: E) => {
    htmlHandler?.(event);
    handler(event);
  };
}

function onEvent(setEvents: React.Dispatch<React.SetStateAction<string[]>>) {
  return (event: React.SyntheticEvent) => {
    const { type } = event;
    const target = event.target as HTMLElement;
    const label = target.getAttribute("aria-label") || target.textContent;
    setEvents((prevEvents) => [...prevEvents, `${type} ${label}`]);
  };
}

const CustomContainer = React.forwardRef<HTMLDivElement, Props<HTMLDivElement>>(
  ({ setEvents, ...props }, ref) => (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={ref}
      {...props}
      onKeyDown={mergeEvent(onEvent(setEvents), props.onKeyDown)}
      onKeyUp={mergeEvent(onEvent(setEvents), props.onKeyUp)}
      // onFocus={mergeEvent(onEvent(setEvents), props.onFocus)}
      // onBlur={mergeEvent(onEvent(setEvents), props.onBlur)}
    />
  )
);

const CustomItem = React.forwardRef<
  HTMLButtonElement,
  Props<HTMLButtonElement>
>(({ setEvents, ...props }, ref) => (
  <button
    ref={ref}
    {...props}
    // onBlur={mergeEvent(onEvent(setEvents), props.onBlur)}
  />
));

export default function CompositeAsProp() {
  const composite = useCompositeState({ unstable_virtual: true });
  const [events, setEvents] = React.useState<string[]>([]);
  return (
    <>
      <Composite
        {...composite}
        role="listbox"
        aria-label="composite"
        as={CustomContainer}
        setEvents={setEvents}
      >
        <CompositeItem
          {...composite}
          as={CustomItem}
          role="option"
          setEvents={setEvents}
        >
          Item 1
        </CompositeItem>
        <CompositeItem
          {...composite}
          as={CustomItem}
          role="option"
          setEvents={setEvents}
        >
          Item 2
        </CompositeItem>
        <CompositeItem
          {...composite}
          as={CustomItem}
          role="option"
          setEvents={setEvents}
        >
          Item 3
        </CompositeItem>
      </Composite>
      <div aria-label="events">{events}</div>
    </>
  );
}
