import * as Ariakit from "@ariakit/react";
import { useMemo, useRef, useState, useCallback, startTransition } from "react";

const allItems = Array.from(
  { length: 100 },
  (_, i) => `Option ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26)}`,
);

const PAGE_SIZE = 20;

export default function Example() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const listRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    if (!searchValue) return allItems;
    return allItems.filter((item) =>
      item.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [searchValue]);

  const visibleItems = useMemo(
    () => matches.slice(0, visibleCount),
    [matches, visibleCount],
  );

  const hasMore = visibleCount < matches.length;

  const handleScroll = useCallback(() => {
    if (!listRef.current || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, matches.length));
    }
  }, [hasMore, matches.length]);

  return (
    <Ariakit.ComboboxProvider
      defaultOpen
      selectedValue={selectedValues}
      setSelectedValue={setSelectedValues}
      setValue={(value) => {
        startTransition(() => {
          setSearchValue(value);
          setVisibleCount(PAGE_SIZE);
        });
      }}
    >
      <Ariakit.ComboboxLabel>Items</Ariakit.ComboboxLabel>
      <Ariakit.Combobox autoFocus placeholder="Search items..." />
      <Ariakit.ComboboxPopover
        ref={listRef}
        onScroll={handleScroll}
        sameWidth
        gutter={4}
        style={{ maxHeight: 300, overflow: "auto" }}
      >
        {visibleItems.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value}>
            <Ariakit.ComboboxItemCheck />
            {value}
          </Ariakit.ComboboxItem>
        ))}
        {hasMore && <div>Scroll for more...</div>}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
