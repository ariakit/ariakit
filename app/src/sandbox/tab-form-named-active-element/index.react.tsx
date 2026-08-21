import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "billing", label: "Billing" },
];

// A saved-views form on the page carries a name that collides with the member
// the tab store reads to learn whether a tab holds focus, so the document
// answers `activeElement` with the form. Selecting a section through the
// number shortcut then leaves keyboard focus behind on the previous tab.
export default function Example() {
  const tab = Ariakit.useTabStore({ defaultSelectedId: "overview" });
  const [focusHistory, setFocusHistory] = useState<string[]>([]);
  const recordFocus = (name: string) => {
    setFocusHistory((history) => [...history, name]);
  };

  return (
    <main>
      <h1>Account</h1>

      <form name="activeElement" aria-label="Saved views">
        <label>
          View name
          <input name="view" defaultValue="Last quarter" />
        </label>
      </form>

      <p>Focus a tab, then press 1, 2, or 3 to jump to a section.</p>

      {/* The named form makes `document.activeElement` answer with itself, so
          Playwright's `toBeFocused` can never pass on this page: it compares
          `getRootNode().activeElement` against the node. Focus is reported
          through the output below instead. */}
      <Ariakit.TabList
        store={tab}
        aria-label="Account sections"
        onKeyDown={(event) => {
          const section = sections[Number(event.key) - 1];
          if (!section) return;
          tab.setSelectedId(section.id);
        }}
      >
        {sections.map((section) => (
          <Ariakit.Tab
            key={section.id}
            id={section.id}
            onFocus={() => recordFocus(section.label)}
          >
            {section.label}
          </Ariakit.Tab>
        ))}
      </Ariakit.TabList>

      {sections.map((section) => (
        <Ariakit.TabPanel key={section.id} store={tab} tabId={section.id}>
          {section.label} panel
        </Ariakit.TabPanel>
      ))}

      <output aria-label="Focus history">
        {focusHistory.join(" → ") || "none"}
      </output>
    </main>
  );
}
