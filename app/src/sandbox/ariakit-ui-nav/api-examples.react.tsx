/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  Nav,
  NavGlider,
  NavLink,
} from "@ariakit/ui/components/nav.ariakit.react";
import { useRef, useState } from "react";

export function HorizontalNavigation() {
  const [current, setCurrent] = useState("Overview");
  const [rtl, setRtl] = useState(false);
  const [gap, setGap] = useState("auto");
  const [side, setSide] = useState<"start" | "end">("end");
  const [padded, setPadded] = useState(true);
  return (
    <section
      aria-label="Horizontal navigation example"
      className="grid gap-4 min-w-0"
    >
      <label>
        <input
          type="checkbox"
          checked={rtl}
          onChange={(event) => setRtl(event.target.checked)}
        />{" "}
        Right to left
      </label>
      <label>
        <input
          type="checkbox"
          checked={padded}
          onChange={(event) => setPadded(event.target.checked)}
        />{" "}
        Add frame padding
      </label>
      <label>
        Bar distance{" "}
        <select value={gap} onChange={(event) => setGap(event.target.value)}>
          <option value="auto">Frame padding</option>
          <option value="6px">6px</option>
          <option value="frame">Frame edge</option>
        </select>
      </label>
      <label>
        Bar side{" "}
        <select
          value={side}
          onChange={(event) =>
            setSide(event.target.value === "start" ? "start" : "end")
          }
        >
          <option value="end">Bottom</option>
          <option value="start">Top</option>
        </select>
      </label>
      <Nav
        $layout="horizontal"
        $p={padded ? 3 : undefined}
        $border
        $rounded="lg"
        dir={rtl ? "rtl" : "ltr"}
        aria-label="Project pages"
        className="w-80 max-w-full"
        glider={{
          $kind: "bar",
          $animated: false,
          $side: side,
          $barOffset: gap,
        }}
      >
        {["Overview", "Activity", "Members", "Integrations", "Settings"].map(
          (name) => (
            <NavLink
              key={name}
              href={`#${name.toLowerCase()}`}
              tabIndex={0}
              aria-current={name === current ? "step" : undefined}
              $selectedOffset={1}
              onClick={(event) => {
                event.preventDefault();
                setCurrent(name);
              }}
            >
              {name}
            </NavLink>
          ),
        )}
      </Nav>
      <p>Current project page: {current}</p>
    </section>
  );
}

export function LinkItems() {
  const link = useRef<HTMLAnchorElement>(null);
  const [visited, setVisited] = useState("None");
  return (
    <section aria-label="Link item ownership" className="grid gap-4">
      <Button onClick={() => link.current?.focus()}>
        Focus project overview
      </Button>
      <Nav aria-label="Link wrappers">
        <NavLink
          ref={link}
          href="#overview"
          className="project-link"
          item={{ className: "project-item" }}
          render={<a title="Overview destination" />}
          onClick={(event) => {
            event.preventDefault();
            setVisited(event.currentTarget.tagName);
          }}
        >
          Project overview
        </NavLink>
        <NavLink item={<li className="custom-item" />} href="#activity">
          Project activity
        </NavLink>
        <li>
          <NavLink item={false} href="#members">
            Project members
          </NavLink>
        </li>
      </Nav>
      <Nav list={false} aria-label="Single link" $p={3}>
        <NavGlider $kind="bar" $animated={false} />
        <NavLink item={false} href="#home" aria-current="location">
          Home
        </NavLink>
      </Nav>
      <p>Last activated element: {visited}</p>
    </section>
  );
}
