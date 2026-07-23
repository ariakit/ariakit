import * as Ariakit from "@ariakit/react";
import { SelectRenderer } from "@ariakit/react-components/select/select-renderer";
import type { SelectRendererItem } from "@ariakit/react-components/select/select-renderer";
import type { SelectRendererItemObject } from "@ariakit/react-components/select/select-renderer";
import type { ComponentProps, RefCallback } from "react";
import {
  createContext,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./style.css";

interface FruitItem extends SelectRendererItemObject {
  id: string;
  label?: string;
  items?: FruitItem[];
}

function getItem(value: string): FruitItem {
  return { id: `item-${value.toLowerCase()}`, value };
}

const citrusItems = ["Lemon", "Lime", "Orange"].map(getItem);
const otherItems = ["Apple", "Banana"].map(getItem);

const items: readonly FruitItem[] = [
  {
    id: "group-citrus",
    label: "Citrus",
    itemSize: 40,
    paddingStart: 44,
    items: citrusItems,
  },
  ...otherItems,
];

const defaultItems = [...citrusItems, ...otherItems];

const horizontalItems = [
  { id: "apple", value: "apple", label: "Apple" },
  { id: "banana", value: "banana", label: "Banana" },
  { id: "cherry", value: "cherry", label: "Cherry" },
] satisfies readonly SelectRendererItem[];

const asyncItems = Array.from({ length: 100 }, (_, index) => ({
  id: `async-item-${index + 1}`,
  value: `Async item ${index + 1}`,
}));

function GroupedRenderer() {
  const select = Ariakit.useSelectStore({ defaultItems, defaultValue: "" });

  return (
    <>
      <Ariakit.SelectLabel store={select}>Fruit</Ariakit.SelectLabel>
      <Ariakit.Select store={select} />
      <Ariakit.SelectPopover
        store={select}
        gutter={4}
        sameWidth
        style={{ background: "white", border: "1px solid gray" }}
      >
        <SelectRenderer
          store={select}
          items={items}
          initialItems={items.length}
          persistentIndices={[1]}
        >
          {(item) => {
            if (item.items) {
              const { label, ...groupProps } = item;
              return (
                <SelectRenderer
                  key={groupProps.id}
                  {...groupProps}
                  initialItems={item.items.length}
                  render={(props) => (
                    <Ariakit.SelectGroup {...props}>
                      <Ariakit.SelectGroupLabel>
                        {label}
                      </Ariakit.SelectGroupLabel>
                      {props.children}
                    </Ariakit.SelectGroup>
                  )}
                >
                  {({ value, ...optionProps }) => (
                    <Ariakit.SelectItem
                      key={optionProps.id}
                      value={value}
                      {...optionProps}
                    />
                  )}
                </SelectRenderer>
              );
            }
            const { value, ...optionProps } = item;
            return (
              <Ariakit.SelectItem
                key={optionProps.id}
                value={value}
                {...optionProps}
              />
            );
          }}
        </SelectRenderer>
      </Ariakit.SelectPopover>
    </>
  );
}

function HorizontalRenderer() {
  const select = Ariakit.useSelectStore({ defaultValue: "apple" });

  return (
    <Ariakit.SelectProvider store={select}>
      <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover gutter={4} className="popover">
        <SelectRenderer
          orientation="horizontal"
          items={horizontalItems}
          initialItems={horizontalItems.length}
          itemSize={96}
          className="renderer"
        >
          {({ value, label, ...item }) => (
            <Ariakit.SelectItem
              key={item.id}
              value={value}
              {...item}
              className="option"
            >
              {label}
            </Ariakit.SelectItem>
          )}
        </SelectRenderer>
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}

function AsyncRenderer() {
  const [items, setItems] = useState<typeof asyncItems>([]);
  const [itemSize, setItemSize] = useState(40);
  const [scrollObserved, setScrollObserved] = useState(false);
  const [scrollElementConnected, setScrollElementConnected] = useState(false);
  const [scrollElementEnabled, setScrollElementEnabled] = useState(true);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const groupedItems = useMemo(
    () => [{ id: "async-group", itemSize, items }],
    [itemSize, items],
  );

  return (
    <section>
      <button type="button" onClick={() => setItems(asyncItems)}>
        Load async items
      </button>
      <button type="button" onClick={() => setScrollElementConnected(true)}>
        Connect scroll element
      </button>
      <button
        type="button"
        onClick={() => {
          setScrollElementEnabled(false);
          setItemSize(80);
        }}
      >
        Disable scroll element and double item size
      </button>
      <button
        type="button"
        onClick={() => {
          setScrollElementConnected(false);
          setItemSize(80);
        }}
      >
        Disconnect scroll element and double item size
      </button>
      <p role="status" aria-label="Async scroll status">
        Scroll observed: {scrollObserved ? "yes" : "no"}
      </p>
      <div
        ref={scrollElementConnected ? scrollElementRef : null}
        className="async-scroller"
        role="listbox"
        aria-label="Async items"
      >
        <SelectRenderer
          items={groupedItems}
          initialItems={1}
          scrollElement={scrollElementEnabled ? scrollElementRef : null}
        >
          {({ items, ...group }) => (
            <SelectRenderer
              key={group.id}
              {...group}
              items={items}
              role="group"
              renderOnScroll={() => {
                setScrollObserved(true);
                return true;
              }}
            >
              {({ value, index, ...item }) => (
                <div key={item.id} {...item} data-index={index} role="option">
                  {value}
                </div>
              )}
            </SelectRenderer>
          )}
        </SelectRenderer>
      </div>
    </section>
  );
}

function NestedAutoRenderer() {
  const groupedItems = useMemo(
    () => [{ id: "nested-auto-group", itemSize: 40, items: asyncItems }],
    [],
  );

  return (
    <section>
      <SelectRenderer items={groupedItems} initialItems={1}>
        {({ items, ...group }) => (
          <div
            key={group.id}
            className="async-scroller nested-auto-scroller"
            role="listbox"
            aria-label="Nested auto items"
          >
            <SelectRenderer {...group} items={items} initialItems={1}>
              {({ value, index, ...item }) => (
                <div key={item.id} {...item} data-index={index} role="option">
                  {value}
                </div>
              )}
            </SelectRenderer>
          </div>
        )}
      </SelectRenderer>
    </section>
  );
}

function DirectElementRenderer() {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [enabled, setEnabled] = useState(false);
  const setScrollerRef = useCallback((element: HTMLDivElement | null) => {
    if (!element) return;
    Object.defineProperty(element, "current", {
      configurable: true,
      value: 0,
    });
    setScrollElement(element);
  }, []);

  return (
    <section>
      <button type="button" onClick={() => setEnabled(true)}>
        Use direct scroll element
      </button>
      <div
        ref={setScrollerRef}
        className="async-scroller"
        role="listbox"
        aria-label="Direct element items"
      >
        <SelectRenderer
          items={asyncItems}
          initialItems={1}
          itemSize={40}
          scrollElement={enabled ? scrollElement : null}
        >
          {({ value, index, ...item }) => (
            <div key={item.id} {...item} data-index={index} role="option">
              {value}
            </div>
          )}
        </SelectRenderer>
      </div>
    </section>
  );
}

function ControllerLifetimeRenderer() {
  const [scrollElement, setScrollElement] =
    useState<() => HTMLElement | null>();
  const [released, setReleased] = useState<boolean>();
  const [revision, setRevision] = useState(0);
  const scrollElementRef = useRef<WeakRef<HTMLElement>>(null);

  useEffect(() => {
    const element = document.createElement("div");
    scrollElementRef.current = new WeakRef(element);
    setScrollElement(() => () => {
      if (element.isConnected) {
        return element;
      }
      return null;
    });
  }, []);

  const useAutomaticScrollElement = () => {
    if (!scrollElement) return;
    setScrollElement(undefined);
  };

  return (
    <section>
      <button type="button" onClick={useAutomaticScrollElement}>
        Use automatic scroll element
      </button>
      <button
        type="button"
        onClick={() => setRevision((currentRevision) => currentRevision + 1)}
      >
        Rerender lifetime probe
      </button>
      <button
        type="button"
        onClick={() => setReleased(!scrollElementRef.current?.deref())}
      >
        Check released scroll element
      </button>
      <p role="status" aria-label="Controller lifetime status">
        Explicit target ready: {scrollElement ? "yes" : "no"}; Released:{" "}
        {released === undefined ? "unchecked" : released ? "yes" : "no"};
        Revision: {revision}
      </p>
      <SelectRenderer
        data-revision={revision}
        items={asyncItems}
        initialItems={1}
        itemSize={40}
        scrollElement={scrollElement}
      >
        {({ value, index, ...item }) => (
          <div key={item.id} {...item} data-index={index} role="option">
            {value}
          </div>
        )}
      </SelectRenderer>
    </section>
  );
}

function InitialRefRenderer() {
  const scrollElementRef = useRef<HTMLDivElement>(null);

  return (
    <section>
      <div
        ref={scrollElementRef}
        className="async-scroller"
        role="listbox"
        aria-label="Initial ref items"
      >
        <SelectRenderer
          items={asyncItems}
          initialItems={1}
          itemSize={40}
          scrollElement={scrollElementRef}
        >
          {({ value, index, ...item }) => (
            <div key={item.id} {...item} data-index={index} role="option">
              {value}
            </div>
          )}
        </SelectRenderer>
      </div>
    </section>
  );
}

interface TrackedOptionProps extends Omit<ComponentProps<"div">, "ref"> {
  elementRef: RefCallback<HTMLElement>;
  index: number;
  onMount: (value: string) => void;
  value: string;
}

function TrackedOption({
  elementRef,
  index,
  onMount,
  value,
  ...props
}: TrackedOptionProps) {
  useEffect(() => {
    onMount(value);
  }, [onMount, value]);

  return (
    <div ref={elementRef} {...props} data-index={index} role="option">
      {value}
    </div>
  );
}

const InheritedTargetChildContext = createContext({
  overscan: 1,
  revision: false,
});
const inheritedTargetItems = [
  { id: "inherited-target-group", itemSize: 40, items: asyncItems },
];

interface InheritedTargetOwnerProps {
  onMount: (value: string) => void;
  resolveScroller: () => HTMLElement | null;
}

const InheritedTargetOwner = memo(function InheritedTargetOwner({
  onMount,
  resolveScroller,
}: InheritedTargetOwnerProps) {
  return (
    <SelectRenderer
      items={inheritedTargetItems}
      initialItems={1}
      scrollElement={resolveScroller}
    >
      {({ items, ...group }) => (
        <InheritedTargetChildContext.Consumer key={group.id}>
          {({ overscan, revision }) => (
            <SelectRenderer
              {...group}
              items={items}
              initialItems={1}
              overscan={overscan}
              className={revision ? "inherited-target-updated" : undefined}
            >
              {({ value, index, ref, ...item }) => (
                <TrackedOption
                  key={item.id}
                  {...item}
                  elementRef={ref}
                  index={index}
                  onMount={onMount}
                  value={value}
                />
              )}
            </SelectRenderer>
          )}
        </InheritedTargetChildContext.Consumer>
      )}
    </SelectRenderer>
  );
});

function InheritedTargetRenderer() {
  const [overscan, setOverscan] = useState(1);
  const [revision, setRevision] = useState(false);
  const [useInnerScroller, setUseInnerScroller] = useState(false);
  const [mountedItems, setMountedItems] = useState<string[]>([]);
  const outerScrollerRef = useRef<HTMLDivElement>(null);
  const innerScrollerRef = useRef<HTMLDivElement>(null);
  const activeScrollerRef = useRef<HTMLDivElement | null>(null);
  const childContext = useMemo(
    () => ({ overscan, revision }),
    [overscan, revision],
  );
  const resolveScroller = useCallback(() => activeScrollerRef.current, []);
  const recordMount = useCallback((value: string) => {
    setMountedItems((items) => {
      if (items.includes(value)) return items;
      return [...items, value];
    });
  }, []);

  useLayoutEffect(() => {
    activeScrollerRef.current = useInnerScroller
      ? innerScrollerRef.current
      : outerScrollerRef.current;
  }, [useInnerScroller]);

  return (
    <section>
      <button type="button" onClick={() => setMountedItems([])}>
        Clear inherited target mount log
      </button>
      <button
        type="button"
        onClick={() => {
          setUseInnerScroller(true);
          setRevision(true);
        }}
      >
        Use inner scroll element and update child class
      </button>
      <button
        type="button"
        onClick={() => {
          setUseInnerScroller(false);
          setOverscan(2);
        }}
      >
        Use outer scroll element and increase overscan
      </button>
      <p role="status" aria-label="Inherited target mounts">
        Mounted items: {mountedItems.join(", ") || "none"}
      </p>
      <div
        ref={outerScrollerRef}
        className="async-scroller inherited-target-outer"
        role="listbox"
        aria-label="Inherited target items"
      >
        <div ref={innerScrollerRef} className="inherited-target-inner">
          <InheritedTargetChildContext.Provider value={childContext}>
            <InheritedTargetOwner
              onMount={recordMount}
              resolveScroller={resolveScroller}
            />
          </InheritedTargetChildContext.Provider>
        </div>
      </div>
    </section>
  );
}

export default function Example() {
  return (
    <>
      <GroupedRenderer />
      <HorizontalRenderer />
      <AsyncRenderer />
      <NestedAutoRenderer />
      <DirectElementRenderer />
      <ControllerLifetimeRenderer />
      <InitialRefRenderer />
      <InheritedTargetRenderer />
    </>
  );
}
