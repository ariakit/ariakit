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
  NavDisclosure,
  NavGroup,
  NavGroupLabel,
  NavLink,
  NavLinkBar,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { nav, navLink, navLinkBar } from "@ariakit/ui/styles/nav";
import { Star } from "lucide-react";
import { useRef, useState } from "react";

export function BarForms() {
  const [bars, setBars] = useState(true);
  return (
    <section aria-label="Bar forms" className="grid gap-4">
      <label>
        <input
          type="checkbox"
          checked={bars}
          onChange={(event) => setBars(event.target.checked)}
        />{" "}
        Show bars
      </label>
      <Nav aria-label="Bar overrides" $p={3} bar={bars}>
        <NavLink href="#default" aria-current="true">
          <NavSlot>
            <Star />
          </NavSlot>
          Default bar
        </NavLink>
        <NavLink href="#none" aria-current="true" bar={false}>
          No bar
        </NavLink>
        <NavLink
          href="#element"
          aria-current="true"
          bar={<NavLinkBar $side="end" />}
        >
          Element bar
        </NavLink>
      </Nav>
      <nav aria-label="Recipe bar" {...nav.jsx({ $p: 3 })}>
        <a href="#recipe" aria-current="page" {...navLink.jsx()}>
          Recipe link
          <span aria-hidden {...navLinkBar.jsx()} />
        </a>
      </nav>
    </section>
  );
}

export function HorizontalNavigation() {
  const [current, setCurrent] = useState("Overview");
  const [rtl, setRtl] = useState(false);
  const [gap, setGap] = useState("edge");
  const [side, setSide] = useState<"start" | "end">("end");
  const [length, setLength] = useState<"full" | "auto">("auto");
  const [padded, setPadded] = useState(true);
  const [ordered, setOrdered] = useState(false);
  const [borderType, setBorderType] = useState<"auto" | "border">("auto");
  const [groupGap, setGroupGap] = useState(8);
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
        <input
          type="checkbox"
          checked={ordered}
          onChange={(event) => setOrdered(event.target.checked)}
        />{" "}
        Ordered navigation list
      </label>
      <label>
        Bar distance{" "}
        <select value={gap} onChange={(event) => setGap(event.target.value)}>
          <option value="edge">Edge</option>
          <option value="halfway">Halfway</option>
          <option value="6px">6px</option>
          <option value="0px">Against the item</option>
        </select>
      </label>
      <label>
        Bar length{" "}
        <select
          value={length}
          onChange={(event) =>
            setLength(event.target.value === "auto" ? "auto" : "full")
          }
        >
          <option value="auto">Auto</option>
          <option value="full">Full</option>
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
      <label>
        Border type{" "}
        <select
          value={borderType}
          onChange={(event) =>
            setBorderType(event.target.value === "border" ? "border" : "auto")
          }
        >
          <option value="auto">Auto</option>
          <option value="border">Border</option>
        </select>
      </label>
      <Nav
        $layout="horizontal"
        $p={padded ? 3 : "none"}
        $border
        $borderType={borderType}
        $rounded="lg"
        dir={rtl ? "rtl" : "ltr"}
        aria-label="Project pages"
        list={ordered ? <NavList render={<ol />} /> : undefined}
        className="w-80 max-w-full"
        bar={{
          $side: side,
          $offset: gap,
          $length: length,
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
              text={name}
            />
          ),
        )}
      </Nav>
      <p>Current project page: {current}</p>
      <label>
        Group spacing{" "}
        <select
          value={groupGap}
          onChange={(event) => setGroupGap(Number(event.target.value))}
        >
          <option value={8}>Wide</option>
          <option value={4}>Default</option>
        </select>
      </label>
      <Nav
        aria-label="Project groups"
        list={false}
        $layout="horizontal"
        $groupGap={groupGap}
        dir={rtl ? "rtl" : "ltr"}
      >
        <NavGroup>
          <NavGroupLabel>Project</NavGroupLabel>
          <NavList>
            <NavLink href="#overview">Project overview</NavLink>
            <NavLink href="#activity">Project activity</NavLink>
          </NavList>
        </NavGroup>
        <NavGroup>
          <NavGroupLabel>Workspace</NavGroupLabel>
          <NavList>
            <NavDisclosure button="Members" defaultOpen>
              <NavList>
                <NavLink href="#people">People</NavLink>
                <NavLink href="#teams">Teams</NavLink>
              </NavList>
            </NavDisclosure>
          </NavList>
        </NavGroup>
      </Nav>
    </section>
  );
}

const columnPages = ["Overview", "Installation"];
const columnSectionPages = ["Themes", "Tokens"];

/**
 * A vertical navigation with a border, whose current link moves on click. The
 * selects use their own names so they don't match the horizontal ones.
 */
export function BorderedColumn() {
  const [current, setCurrent] = useState("Overview");
  const [side, setSide] = useState<"start" | "end">("start");
  const [gap, setGap] = useState<"edge" | "halfway">("edge");
  const link = (page: string) => (
    <NavLink
      key={page}
      href={`#column-${page.toLowerCase()}`}
      aria-current={current === page ? "page" : undefined}
      onClick={(event) => {
        event.preventDefault();
        setCurrent(page);
      }}
      text={page}
    />
  );
  return (
    <section aria-label="Bordered column example" className="grid gap-4">
      <label>
        Column bar side{" "}
        <select
          value={side}
          onChange={(event) =>
            setSide(event.target.value === "end" ? "end" : "start")
          }
        >
          <option value="start">Start</option>
          <option value="end">End</option>
        </select>
      </label>
      <label>
        Column bar distance{" "}
        <select
          value={gap}
          onChange={(event) =>
            setGap(event.target.value === "halfway" ? "halfway" : "edge")
          }
        >
          <option value="edge">Edge</option>
          <option value="halfway">Halfway</option>
        </select>
      </label>
      <Nav
        aria-label="Bordered pages"
        $p={2}
        $border
        $borderType="border"
        bar={{ $side: side, $offset: gap }}
        className="w-64"
      >
        {columnPages.map(link)}
        <NavDisclosure defaultOpen button="Styling">
          <NavList>{columnSectionPages.map(link)}</NavList>
        </NavDisclosure>
      </Nav>
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
        <NavLink item={false} href="#home" aria-current="location" bar>
          Home
        </NavLink>
      </Nav>
      <p>Last activated element: {visited}</p>
    </section>
  );
}
