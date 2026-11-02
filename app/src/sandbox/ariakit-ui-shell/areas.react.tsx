/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Nav, NavLink } from "@ariakit/ui/components/nav.ariakit.react";
import {
  Shell,
  ShellCenter,
  ShellContent,
  ShellEnd,
  ShellFeature,
  ShellFooter,
  ShellFull,
  ShellHeader,
  ShellMain,
  ShellMainBody,
  ShellMainHeader,
  ShellPopout,
  ShellSidebar,
  ShellSidebarBody,
  ShellStart,
  ShellWide,
} from "@ariakit/ui/components/shell.ariakit.react";
import type { ReactNode } from "react";
import { useState } from "react";

const bands = {
  content: ShellContent,
  popout: ShellPopout,
  feature: ShellFeature,
  wide: ShellWide,
  full: ShellFull,
};
type Band = keyof typeof bands;

const startTexts = {
  short: "Back",
  long: "A much longer product name with a tagline",
};
type StartText = keyof typeof startTexts;

const heights = ["sm", "md", "lg"] as const;
type Height = (typeof heights)[number];

const sizes = ["auto", "sm", "md", "lg"] as const;
type Size = (typeof sizes)[number];

const froms = ["main", "intro", "body"] as const;
type From = (typeof froms)[number];

const middles = ["area", "center", "grow", "plain", "long center"] as const;
type Middle = (typeof middles)[number];

// Enough elements in an area that a fold restyling them is easy to notice.
const items = Array.from({ length: 60 }, (_, index) => (
  <span key={index} className="sr-only">
    Item {index + 1}
  </span>
));

interface SelectProps<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectProps<T>) {
  return (
    <label>
      {label}{" "}
      <select
        value={value}
        onChange={(event) => {
          const { value } = event.currentTarget;
          const option = options.find((option) => option === value);
          if (option) {
            onChange(option);
          }
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />{" "}
      {label}
    </label>
  );
}

/**
 * Content areas in the bars and the main header, compared with the same band in
 * the body.
 */
export function AreasScenario({ controls }: { controls: ReactNode }) {
  const [startOpen, setStartOpen] = useState(true);
  const [endOpen, setEndOpen] = useState(false);
  const [band, setBand] = useState<Band>("content");
  const [middle, setMiddle] = useState<Middle>("area");
  const [startText, setStartText] = useState<StartText>("short");
  const [barHeight, setBarHeight] = useState<Height>("md");
  const [size, setSize] = useState<Size>("auto");
  const [from, setFrom] = useState<From>("main");
  const [barParts, setBarParts] = useState(true);
  const [mainParts, setMainParts] = useState(true);
  const [shrink, setShrink] = useState(false);
  const [shrinkEnd, setShrinkEnd] = useState(false);
  const [minWidth, setMinWidth] = useState(false);
  const [navigation, setNavigation] = useState(false);
  const [customWidth, setCustomWidth] = useState(false);
  const [customGutter, setCustomGutter] = useState(false);
  const [nested, setNested] = useState(false);
  const [directlyNested, setDirectlyNested] = useState(false);
  const [barArea, setBarArea] = useState(true);
  const [cover, setCover] = useState(false);
  const [noGutter, setNoGutter] = useState(false);
  const Band = bands[band];
  const barProps = {
    $maxWidth: customWidth ? 200 : undefined,
    $gutter: customGutter ? 8 : undefined,
  };
  const startPart = (
    <ShellStart
      $shrink={shrink}
      className={shrink && minWidth ? "min-w-[160px]" : undefined}
    >
      <span aria-label="Start text" className={shrink ? "truncate" : undefined}>
        {startTexts[startText]}
      </span>
    </ShellStart>
  );
  const shrinkingEnd = (
    <ShellEnd $shrink>
      <span className="truncate">{startTexts.long}</span>
    </ShellEnd>
  );
  const areaClassName = minWidth ? "min-w-[160px]" : undefined;
  const shell = (
    <Shell>
      <ShellHeader {...barProps} $height={barHeight}>
        {barParts && startPart}
        {barArea && (
          <Band role="group" aria-label="Header area" className={areaClassName}>
            <div>Header area{items}</div>
          </Band>
        )}
        {barParts && (shrinkEnd ? shrinkingEnd : <ShellEnd>Account</ShellEnd>)}
      </ShellHeader>
      <ShellSidebar
        landmark="nav"
        aria-label="Start sidebar"
        $show
        $width="lg"
        open={startOpen}
      >
        <ShellSidebarBody>Sections</ShellSidebarBody>
      </ShellSidebar>
      <ShellMain
        $size={size}
        $maxWidth={customWidth ? 200 : undefined}
        $p={customGutter ? 8 : undefined}
      >
        <ShellMainHeader $p={noGutter ? "none" : undefined}>
          {cover && <Nav aria-label="Cover" $cover />}
          {mainParts && startPart}
          {middle === "plain" && (
            <div aria-label="Plain child">Plain child</div>
          )}
          {(middle === "center" || middle === "grow") && (
            <ShellCenter $grow={middle === "grow" || undefined}>
              <div aria-label="Main header center">Center</div>
            </ShellCenter>
          )}
          {middle === "long center" && (
            <ShellCenter>
              <div aria-label="Main header center">
                A much longer page title that has to wrap on a phone
              </div>
            </ShellCenter>
          )}
          {middle === "area" && (
            <Band
              role="group"
              aria-label="Main header area"
              className={areaClassName}
            >
              {navigation ? (
                <Nav aria-label="Local" $layout="horizontal" $p="none" bar>
                  <NavLink href="#one" text="One" />
                  <NavLink href="#two" text="Two" />
                </Nav>
              ) : (
                <div>Main header area{items}</div>
              )}
            </Band>
          )}
          {mainParts && (shrinkEnd ? shrinkingEnd : <ShellEnd>Share</ShellEnd>)}
        </ShellMainHeader>
        <ShellMainBody>
          <ShellContent role="group" aria-label="Body column">
            <div className="flex flex-wrap gap-2">{controls}</div>
          </ShellContent>
          <Band role="group" aria-label="Body band">
            <div className="flex flex-wrap gap-2">
              <Checkbox
                label="Start sidebar"
                checked={startOpen}
                onChange={setStartOpen}
              />
              <Checkbox
                label="End sidebar"
                checked={endOpen}
                onChange={setEndOpen}
              />
              <Select
                label="End sidebar starts at"
                value={from}
                options={froms}
                onChange={setFrom}
              />
              <Select
                label="Band"
                value={band}
                options={["content", "popout", "feature", "wide", "full"]}
                onChange={setBand}
              />
              <Select
                label="Middle part"
                value={middle}
                options={middles}
                onChange={setMiddle}
              />
              <Select
                label="Start part"
                value={startText}
                options={["short", "long"]}
                onChange={setStartText}
              />
              <Select
                label="Bar height"
                value={barHeight}
                options={heights}
                onChange={setBarHeight}
              />
              <Select
                label="Main size"
                value={size}
                options={sizes}
                onChange={setSize}
              />
              <Checkbox
                label="Bar side parts"
                checked={barParts}
                onChange={setBarParts}
              />
              <Checkbox
                label="Main header side parts"
                checked={mainParts}
                onChange={setMainParts}
              />
              <Checkbox
                label="Shrink start part"
                checked={shrink}
                onChange={setShrink}
              />
              <Checkbox
                label="Shrink end part"
                checked={shrinkEnd}
                onChange={setShrinkEnd}
              />
              <Checkbox
                label="Area minimum width"
                checked={minWidth}
                onChange={setMinWidth}
              />
              <Checkbox
                label="Navigation in the main header"
                checked={navigation}
                onChange={setNavigation}
              />
              <Checkbox
                label="Custom column"
                checked={customWidth}
                onChange={setCustomWidth}
              />
              <Checkbox
                label="Custom gutter"
                checked={customGutter}
                onChange={setCustomGutter}
              />
              <Checkbox
                label="Nested shell"
                checked={nested}
                onChange={setNested}
              />
              <Checkbox
                label="Directly nested shell"
                checked={directlyNested}
                onChange={setDirectlyNested}
              />
              <Checkbox
                label="Area in the header"
                checked={barArea}
                onChange={setBarArea}
              />
              <Checkbox
                label="Cover child in the main header"
                checked={cover}
                onChange={setCover}
              />
              <Checkbox
                label="No main header gutter"
                checked={noGutter}
                onChange={setNoGutter}
              />
            </div>
          </Band>
          {nested && (
            <ShellFull>
              <Shell>
                <ShellHeader $sticky={false}>
                  <ShellStart>Inner</ShellStart>
                  <ShellContent role="group" aria-label="Inner header area">
                    <div>Inner header area</div>
                  </ShellContent>
                  <ShellEnd>End</ShellEnd>
                </ShellHeader>
                <ShellSidebar
                  landmark="nav"
                  aria-label="Inner sidebar"
                  $show
                  $width="sm"
                >
                  <ShellSidebarBody>Inner sections</ShellSidebarBody>
                </ShellSidebar>
                <ShellMain>
                  <ShellMainHeader $sticky={false}>
                    <ShellStart>Back</ShellStart>
                    <ShellContent
                      role="group"
                      aria-label="Inner main header area"
                    >
                      <div>Inner main header area</div>
                    </ShellContent>
                    <ShellEnd>Share</ShellEnd>
                  </ShellMainHeader>
                  <ShellMainBody>
                    <ShellContent role="group" aria-label="Inner body column">
                      <div>Inner body</div>
                    </ShellContent>
                  </ShellMainBody>
                </ShellMain>
              </Shell>
            </ShellFull>
          )}
        </ShellMainBody>
      </ShellMain>
      <ShellSidebar
        landmark="aside"
        aria-label="End sidebar"
        $side="end"
        $show
        $width="md"
        $from={from}
        open={endOpen}
      >
        <ShellSidebarBody>Details</ShellSidebarBody>
      </ShellSidebar>
      <ShellFooter {...barProps}>
        {barParts && <ShellStart>Ariakit</ShellStart>}
        <Band role="group" aria-label="Footer area">
          <div>Footer area</div>
        </Band>
        {barParts && <ShellEnd>Help</ShellEnd>}
      </ShellFooter>
    </Shell>
  );
  if (!directlyNested) return shell;
  // A shell as a direct child of a shell, like a full-height outer sidebar.
  return (
    <Shell>
      <ShellSidebar landmark="nav" aria-label="Outer sidebar" $show $width="sm">
        <ShellSidebarBody>Outer sections</ShellSidebarBody>
      </ShellSidebar>
      {shell}
    </Shell>
  );
}
