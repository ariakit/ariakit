/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import {
  Shell,
  ShellHeader,
  ShellMain,
  ShellMainBody,
  ShellMainHeader,
  ShellMainIntro,
  ShellSidebar,
  ShellSidebarBody,
  ShellSidebarFooter,
  ShellSidebarHeader,
} from "@ariakit/ui/components/shell.ariakit.react";
import { useState } from "react";
import type { ReactNode } from "react";

const starts = ["main", "intro", "body"] as const;
type Start = (typeof starts)[number];

function isStart(value: string): value is Start {
  return starts.some((start) => start === value);
}

export function PartsScenario({ controls }: { controls: ReactNode }) {
  const [textSize, setTextSize] = useState("");
  const [spacingGutter, setSpacingGutter] = useState(false);
  const [from, setFrom] = useState<Start>("intro");
  const [endOpen, setEndOpen] = useState(true);
  const [secondEnd, setSecondEnd] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [showGlobalHeader, setShowGlobalHeader] = useState(true);
  const [sticky, setSticky] = useState(true);
  const [compact, setCompact] = useState(false);
  const [wideBorder, setWideBorder] = useState(false);
  const [centered, setCentered] = useState(false);
  const [mainCentered, setMainCentered] = useState(false);
  const [localPadding, setLocalPadding] = useState(false);
  const [introMaxWidth, setIntroMaxWidth] = useState("");
  const [narrowShell, setNarrowShell] = useState(false);
  const [nestedHeaders, setNestedHeaders] = useState(false);
  const [tallerNestedHeader, setTallerNestedHeader] = useState(false);
  const center = centered ? (mainCentered ? "main" : true) : false;
  const height = compact ? "sm" : undefined;
  return (
    <Shell
      $headerBorder={wideBorder ? 3 : 1}
      className={narrowShell ? "max-w-[60rem]" : undefined}
    >
      {showGlobalHeader && <ShellHeader start="Shell parts" end={controls} />}
      <ShellSidebar
        $from="main"
        $width="xs"
        $collapse={false}
        aria-label="Part navigation"
        render={<nav />}
      >
        <ShellSidebarHeader $height={height} $border={5} className={textSize}>
          Navigation
        </ShellSidebarHeader>
        <ShellSidebarBody>
          <ol>
            {Array.from({ length: 60 }, (_, index) => (
              <li key={index} className="py-2">
                <a href="#part-content">Section {index + 1}</a>
              </li>
            ))}
          </ol>
        </ShellSidebarBody>
        <ShellSidebarFooter>Navigation footer</ShellSidebarFooter>
      </ShellSidebar>
      <ShellMain
        $p={spacingGutter ? 3 : "var(--page-gutter)"}
        $maxWidth={120}
        className="[--page-gutter:1rem] @5xl/shell:[--page-gutter:2rem]"
      >
        {showHeader && (
          <ShellMainHeader
            className={textSize}
            $height={height}
            $sticky={sticky}
            $border={5}
            $centered={center}
          >
            <div aria-label="Main actions">Page actions</div>
          </ShellMainHeader>
        )}
        {showIntro && (
          <ShellMainIntro
            className={textSize}
            $centered={center}
            $maxWidth={introMaxWidth || undefined}
            $p={localPadding ? 2 : undefined}
          >
            <h1>Explicit shell parts</h1>
          </ShellMainIntro>
        )}
        <ShellMainBody $centered={center}>
          <section
            id="part-content"
            aria-label="Main content"
            className="grid gap-3"
          >
            {!showGlobalHeader && controls}
            <label>
              Intro maximum width{" "}
              <select
                value={introMaxWidth}
                onChange={(event) =>
                  setIntroMaxWidth(event.currentTarget.value)
                }
              >
                <option value="">Shared</option>
                <option value="50%">Half the part</option>
                <option value="calc(100% - 10rem)">Part minus 10rem</option>
                <option value="min(40rem, 80%)">
                  Smaller of 40rem and 80%
                </option>
                <option value="20rem">20rem</option>
              </select>
            </label>
            <label>
              Local text size{" "}
              <select
                value={textSize}
                onChange={(event) => setTextSize(event.currentTarget.value)}
              >
                <option value="">Default</option>
                <option value="text-sm">Small</option>
                <option value="text-lg">Large</option>
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={spacingGutter}
                onChange={(event) =>
                  setSpacingGutter(event.currentTarget.checked)
                }
              />
              Use spacing gutter
            </label>
            <label>
              End sidebar starts at{" "}
              <select
                value={from}
                onChange={(event) => {
                  if (isStart(event.currentTarget.value)) {
                    setFrom(event.currentTarget.value);
                  }
                }}
              >
                {starts.map((start) => (
                  <option key={start}>{start}</option>
                ))}
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={endOpen}
                onChange={(event) => setEndOpen(event.currentTarget.checked)}
              />{" "}
              Open end sidebar
            </label>
            <label>
              <input
                type="checkbox"
                checked={secondEnd}
                onChange={(event) => setSecondEnd(event.currentTarget.checked)}
              />{" "}
              Second end sidebar
            </label>
            <label>
              <input
                type="checkbox"
                checked={showGlobalHeader}
                onChange={(event) =>
                  setShowGlobalHeader(event.currentTarget.checked)
                }
              />{" "}
              Global header
            </label>
            <label>
              <input
                type="checkbox"
                checked={showHeader}
                onChange={(event) => setShowHeader(event.currentTarget.checked)}
              />{" "}
              Main header
            </label>
            <label>
              <input
                type="checkbox"
                checked={showIntro}
                onChange={(event) => setShowIntro(event.currentTarget.checked)}
              />{" "}
              Main intro
            </label>
            <label>
              <input
                type="checkbox"
                checked={sticky}
                onChange={(event) => setSticky(event.currentTarget.checked)}
              />{" "}
              Sticky main header
            </label>
            <label>
              <input
                type="checkbox"
                checked={compact}
                onChange={(event) => setCompact(event.currentTarget.checked)}
              />{" "}
              Compact local headers
            </label>
            <label>
              <input
                type="checkbox"
                checked={wideBorder}
                onChange={(event) => setWideBorder(event.currentTarget.checked)}
              />{" "}
              Wide global border
            </label>
            <label>
              <input
                type="checkbox"
                checked={centered}
                onChange={(event) => setCentered(event.currentTarget.checked)}
              />{" "}
              Center parts
            </label>
            <label>
              <input
                type="checkbox"
                checked={mainCentered}
                onChange={(event) =>
                  setMainCentered(event.currentTarget.checked)
                }
              />{" "}
              Center within main
            </label>
            <label>
              <input
                type="checkbox"
                checked={localPadding}
                onChange={(event) =>
                  setLocalPadding(event.currentTarget.checked)
                }
              />{" "}
              Local intro padding
            </label>
            <label>
              <input
                type="checkbox"
                checked={narrowShell}
                onChange={(event) =>
                  setNarrowShell(event.currentTarget.checked)
                }
              />{" "}
              Narrow shell
            </label>
            <label>
              <input
                type="checkbox"
                checked={nestedHeaders}
                onChange={(event) =>
                  setNestedHeaders(event.currentTarget.checked)
                }
              />
              Nested main headers
            </label>
            {nestedHeaders && (
              <label>
                <input
                  type="checkbox"
                  checked={tallerNestedHeader}
                  onChange={(event) =>
                    setTallerNestedHeader(event.currentTarget.checked)
                  }
                />
                Taller nested main header
              </label>
            )}
          </section>
          <Shell aria-label="Nested parts shell" className="mt-4 max-w-3xl">
            <ShellHeader start="Nested header" />
            <ShellMain
              render={<div />}
              $p="var(--nested-gutter)"
              className="[--nested-gutter:1rem] @5xl/shell:[--nested-gutter:2rem]"
            >
              {nestedHeaders && (
                <ShellMainHeader $height={tallerNestedHeader ? "lg" : "sm"}>
                  <div>Nested actions</div>
                </ShellMainHeader>
              )}
              <ShellMainBody>
                <p>Nested body</p>
                {nestedHeaders && (
                  <Shell aria-label="Inner parts shell">
                    <ShellHeader start="Inner header" />
                    <ShellMain render={<div />}>
                      <ShellMainHeader $height="lg">
                        <div>Inner actions</div>
                      </ShellMainHeader>
                      <ShellMainBody>
                        <p>Inner body</p>
                        <div className="h-[1200px]" />
                      </ShellMainBody>
                    </ShellMain>
                  </Shell>
                )}
                <div className="h-[1200px]" />
              </ShellMainBody>
            </ShellMain>
          </Shell>
          <div className="h-[1200px]">After the nested shell</div>
        </ShellMainBody>
      </ShellMain>
      <ShellSidebar
        $side="end"
        $from={from}
        $width="xs"
        open={endOpen}
        aria-label="Part details"
        render={<aside />}
      >
        <ShellSidebarBody>Details start at {from}.</ShellSidebarBody>
      </ShellSidebar>
      {secondEnd && (
        <ShellSidebar
          $side="end"
          $from="body"
          $width="xs"
          aria-label="More details"
          render={<aside />}
        >
          <ShellSidebarBody>More details start at the body.</ShellSidebarBody>
        </ShellSidebar>
      )}
    </Shell>
  );
}
