import "./style.css";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import * as Ariakit from "@ariakit/react";
import items from "./items.js";

export default function Example() {
  const menu = Ariakit.useMenuStore();
  const mounted = menu.useState("mounted");
  const [animated, setAnimated] = useState(false);
  const anchorElement = menu.useState("anchorElement");
  const current = anchorElement?.dataset.label || "Home";
  const isFirst = current === items.at(0)?.label;
  const isLast = current === items.at(-1)?.label;
  const subItems = useMemo(
    () => items.find((item) => item.label === current)?.items || [],
    [current],
  );

  useLayoutEffect(() => {
    if (!mounted) return;
    if (!subItems.length) return;
    anchorElement?.focus();
  }, [mounted, anchorElement, subItems]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setAnimated(true);
    });
    return () => {
      setAnimated(false);
      cancelAnimationFrame(raf);
    };
  }, [mounted]);

  return (
    <div>
      <Ariakit.MenuBarProvider>
        <Ariakit.MenuBar className="menu-bar">
          <Ariakit.MenuProvider
            store={menu}
            hideTimeout={200}
            placement={
              isFirst ? "bottom-start" : isLast ? "bottom-end" : "bottom"
            }
          >
            {items.map((item) => {
              if ("items" in item) {
                return (
                  <Ariakit.MenuButton
                    key={item.label}
                    render={
                      <Ariakit.MenuItem
                        tabbable
                        focusOnHover={(event) => event.type !== "mouseleave"}
                        render={item.href ? <a href={item.href} /> : undefined}
                      />
                    }
                    className="menu-item"
                    data-label={item.label}
                    showOnHover
                  >
                    {item.label}
                  </Ariakit.MenuButton>
                );
              }
              return (
                <Ariakit.MenuItem
                  tabbable
                  key={item.label}
                  className="menu-item"
                  render={item.href ? <a href={item.href} /> : undefined}
                >
                  {item.label}
                </Ariakit.MenuItem>
              );
            })}
            {!!subItems.length && (
              <Ariakit.Menu
                gutter={8}
                shift={isFirst || isLast ? -48 : 0}
                className="menu"
                unmountOnHide
                tabIndex={-1}
                portal
                onClose={() => menu.setState("moves", 0)}
                wrapperProps={{ className: animated ? "aaa" : "" }}
              >
                <Ariakit.HovercardArrow className={animated ? "aaa" : ""} />
                {subItems.map((item) => {
                  if ("items" in item) {
                    return (
                      <Ariakit.MenuGroup
                        key={item.label}
                        className="menu-group"
                      >
                        <Ariakit.MenuHeading className="menu-heading">
                          {item.label}
                        </Ariakit.MenuHeading>
                        {item.items?.map((item) => (
                          <Ariakit.MenuItem
                            tabbable
                            key={item.label}
                            className="menu-item"
                          >
                            {item.label}
                          </Ariakit.MenuItem>
                        ))}
                      </Ariakit.MenuGroup>
                    );
                  }
                  return (
                    <Ariakit.MenuItem
                      tabbable
                      key={item.label}
                      className="menu-item"
                    >
                      {item.label}
                    </Ariakit.MenuItem>
                  );
                })}
              </Ariakit.Menu>
            )}
          </Ariakit.MenuProvider>
        </Ariakit.MenuBar>
      </Ariakit.MenuBarProvider>
    </div>
  );
}
