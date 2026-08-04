import * as Ariakit from "@ariakit/react";

const itemStyle = {
  border: "1px solid #ddd",
  height: 56,
  padding: "12px 16px",
} as const;

function preventScrollOnFocus(element: HTMLElement | null) {
  if (!element) return;
  const focus = element.focus.bind(element);
  element.focus = (options) => focus({ ...options, preventScroll: true });
}

function MenuContent({ label }: { label: string }) {
  return (
    <Ariakit.Menu gutter={4} portal>
      <Ariakit.MenuItem style={itemStyle}>{label} one</Ariakit.MenuItem>
      <Ariakit.MenuItem style={itemStyle}>{label} two</Ariakit.MenuItem>
    </Ariakit.Menu>
  );
}

function MenubarExample() {
  return (
    <section>
      <h2>Menubar</h2>
      <Ariakit.MenubarProvider>
        <Ariakit.Menubar style={{ display: "flex", gap: 8 }}>
          {["File", "Edit", "View"].map((label) => (
            <Ariakit.MenuProvider key={label}>
              <Ariakit.MenuItem
                ref={preventScrollOnFocus}
                render={<Ariakit.MenuButton />}
                style={itemStyle}
              >
                {label}
              </Ariakit.MenuItem>
              <MenuContent label={label} />
            </Ariakit.MenuProvider>
          ))}
        </Ariakit.Menubar>
      </Ariakit.MenubarProvider>
    </section>
  );
}

function ScrollableMenuExample() {
  return (
    <section style={{ marginTop: 1200 }}>
      <h2>Scrollable menu</h2>
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Actions</Ariakit.MenuButton>
        <Ariakit.Menu gutter={4} style={{ maxHeight: 180, overflow: "auto" }}>
          {["Cut", "Copy", "Paste", "Delete", "Duplicate"].map((label) => (
            <Ariakit.MenuItem key={label} style={itemStyle}>
              {label}
            </Ariakit.MenuItem>
          ))}
          <Ariakit.MenuProvider>
            <Ariakit.MenuItem
              ref={preventScrollOnFocus}
              render={<Ariakit.MenuButton />}
              style={itemStyle}
            >
              Share
            </Ariakit.MenuItem>
            <MenuContent label="Share" />
          </Ariakit.MenuProvider>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
    </section>
  );
}

export default function Example() {
  return (
    <main>
      <MenubarExample />
      <ScrollableMenuExample />
    </main>
  );
}
