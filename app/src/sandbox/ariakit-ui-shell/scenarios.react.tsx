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
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Shell,
  ShellBreakout,
  ShellFooter,
  ShellHeader,
  ShellIntro,
  ShellMain,
  ShellSidebar,
} from "@ariakit/ui/components/shell.ariakit.react";
import { useId, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";

interface ScenarioProps {
  controls: ReactNode;
}

type Seam = "border" | "dashed" | "none";

function isSeam(value: string): value is Seam {
  return ["border", "dashed", "none"].includes(value);
}

export function GeometryScenario({ controls }: ScenarioProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [centered, setCentered] = useState(false);
  const [compactGutter, setCompactGutter] = useState(false);
  const [flushGutter, setFlushGutter] = useState(false);
  const [widePadding, setWidePadding] = useState(false);
  const [largeHeader, setLargeHeader] = useState(false);
  const [wideNavigation, setWideNavigation] = useState(false);
  const [seams, setSeams] = useState(true);
  const [inheritSeams, setInheritSeams] = useState(false);
  const [customSidebarColor, setCustomSidebarColor] = useState(false);
  const [sidebarDirection, setSidebarDirection] = useState("inherit");
  const [seam, setSeam] = useState<Seam>("border");
  const [selection, setSelection] = useState("No section selected");
  const startId = useId();
  const endId = useId();
  const gutter = flushGutter ? 0 : compactGutter ? 2 : undefined;
  const border = !seams ? false : inheritSeams ? "inherit" : 2;
  const borderType = seam === "border" ? undefined : seam;
  return (
    <Shell
      $duration={600}
      $border={inheritSeams ? 3 : undefined}
      $headerBorder={border}
      $edge={inheritSeams ? "brand" : undefined}
    >
      <ShellHeader
        $height={largeHeader ? "lg" : "md"}
        $p={widePadding ? 12 : undefined}
        $borderType={borderType}
        start={<span>Layout details</span>}
        end={controls}
      />
      <ShellSidebar
        id={startId}
        aria-label="Layout navigation"
        aria-describedby="navigation-description"
        render={<nav title="Navigation body" />}
        className="layout-navigation"
        dir={sidebarDirection === "inherit" ? undefined : sidebarDirection}
        $edge={customSidebarColor ? "var(--sidebar-edge)" : undefined}
        $edgeRaw={customSidebarColor}
        style={
          customSidebarColor
            ? ({ "--sidebar-edge": "rgb(180 40 80)" } as CSSProperties)
            : undefined
        }
        open={startOpen}
        $width={wideNavigation ? "lg" : "sm"}
        $p={3}
        $border={border}
        $borderType={borderType}
        onClick={() => setSelection("Navigation selected")}
      >
        <a href="#layout-content" tabIndex={0}>
          Layout section
        </a>
      </ShellSidebar>
      <ShellIntro
        $centered={centered}
        $maxWidth={160}
        $p={gutter}
        aria-label="Page introduction"
        className="py-8"
      >
        <h1>Columns and frames</h1>
        <p id="navigation-description">Select a section in the navigation.</p>
      </ShellIntro>
      <ShellMain $centered={centered} $maxWidth={160} $p={gutter}>
        <div id="layout-content" className="grid gap-4">
          <fieldset className="flex flex-wrap gap-4">
            <legend>Layout options</legend>
            <Button
              aria-expanded={startOpen}
              aria-controls={startId}
              onClick={() => setStartOpen(!startOpen)}
            >
              Toggle layout navigation
            </Button>
            <Button
              aria-expanded={endOpen}
              aria-controls={endId}
              onClick={() => setEndOpen(!endOpen)}
            >
              Toggle layout contents
            </Button>
            <label>
              <input
                type="checkbox"
                checked={centered}
                onChange={(event) => setCentered(event.currentTarget.checked)}
              />{" "}
              Centered content
            </label>
            <label>
              <input
                type="checkbox"
                checked={compactGutter}
                onChange={(event) =>
                  setCompactGutter(event.currentTarget.checked)
                }
              />{" "}
              Compact gutter
            </label>
            <label>
              <input
                type="checkbox"
                checked={flushGutter}
                onChange={(event) =>
                  setFlushGutter(event.currentTarget.checked)
                }
              />{" "}
              Flush gutter
            </label>
            <label>
              <input
                type="checkbox"
                checked={widePadding}
                onChange={(event) =>
                  setWidePadding(event.currentTarget.checked)
                }
              />{" "}
              Wide bar padding
            </label>
            <label>
              <input
                type="checkbox"
                checked={largeHeader}
                onChange={(event) =>
                  setLargeHeader(event.currentTarget.checked)
                }
              />{" "}
              Large header
            </label>
            <label>
              <input
                type="checkbox"
                checked={wideNavigation}
                onChange={(event) =>
                  setWideNavigation(event.currentTarget.checked)
                }
              />{" "}
              Wide navigation
            </label>
            <label>
              <input
                type="checkbox"
                checked={seams}
                onChange={(event) => setSeams(event.currentTarget.checked)}
              />{" "}
              Show seams
            </label>
            <label>
              <input
                type="checkbox"
                checked={inheritSeams}
                onChange={(event) =>
                  setInheritSeams(event.currentTarget.checked)
                }
              />{" "}
              Inherit seams
            </label>
            <label>
              <input
                type="checkbox"
                checked={customSidebarColor}
                onChange={(event) =>
                  setCustomSidebarColor(event.currentTarget.checked)
                }
              />{" "}
              Custom sidebar color
            </label>
            <label>
              Sidebar text direction{" "}
              <select
                value={sidebarDirection}
                onChange={(event) =>
                  setSidebarDirection(event.currentTarget.value)
                }
              >
                <option value="inherit">Inherit</option>
                <option value="ltr">Left to right</option>
                <option value="rtl">Right to left</option>
              </select>
            </label>
            <label>
              Seam type{" "}
              <select
                value={seam}
                onChange={(event) => {
                  if (isSeam(event.currentTarget.value)) {
                    setSeam(event.currentTarget.value);
                  }
                }}
              >
                <option value="border">Border</option>
                <option value="dashed">Dashed</option>
                <option value="none">None</option>
              </select>
            </label>
          </fieldset>
          <output>{selection}</output>
        </div>
        <Frame $rounded="8px" $p={2} aria-label="Inset frame">
          Inset frame
        </Frame>
        <ShellBreakout $span="popout" $p={4} aria-label="Popout band">
          <p>Popout text</p>
        </ShellBreakout>
        <ShellBreakout $span="feature" $p={4} aria-label="Feature band">
          <p>Feature text</p>
        </ShellBreakout>
        <ShellBreakout $span="full" $p={4} aria-label="Full band">
          <p>Full text</p>
          <ShellBreakout $span="popout" aria-label="Nested popout band">
            <p>Nested popout text</p>
          </ShellBreakout>
          <table className="w-[1200px]">
            <caption>Wide data table</caption>
            <tbody>
              <tr>
                <td>Wide content must not resize the text column.</td>
              </tr>
            </tbody>
          </table>
        </ShellBreakout>
        <div className="h-[1000px]">
          <p>Scroll to see the contents below the introduction.</p>
        </div>
        <ShellBreakout $span="full" $p={0} aria-label="Flush band">
          <Frame
            $rounded="8px"
            $p={6}
            $layer="brand"
            className="col-span-full!"
            aria-label="Flush frame"
          >
            A band at the shell edge
          </Frame>
        </ShellBreakout>
      </ShellMain>
      <ShellSidebar
        id={endId}
        dir={sidebarDirection === "inherit" ? undefined : sidebarDirection}
        $side="end"
        $width="xs"
        data-open={endOpen ? "" : undefined}
        $from="body"
        $collapse={false}
        $border={border}
        $borderType={borderType}
        render={<nav />}
        aria-label="Layout contents"
      >
        <a href="#layout-content" tabIndex={0}>
          Contents section
        </a>
      </ShellSidebar>
      <ShellFooter
        $p={widePadding ? 12 : undefined}
        $border={border}
        $borderType={borderType}
        start={<span>Layout footer</span>}
      />
    </Shell>
  );
}

export function NestedScenario({ controls }: ScenarioProps) {
  const [largeHeader, setLargeHeader] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [updates, setUpdates] = useState(0);
  return (
    <>
      <Shell aria-label="Outer shell">
        <ShellHeader
          $height="sm"
          start={<span>Outer header</span>}
          end={controls}
        />
        <ShellSidebar
          $width="xs"
          $collapse={false}
          aria-label="Outer navigation"
          render={<nav />}
        >
          <a href="#nested-content" tabIndex={0}>
            Outer section
          </a>
        </ShellSidebar>
        <ShellMain $p={0}>
          <div className="h-40">Outer introduction</div>
          <Shell aria-label="Middle shell">
            <ShellHeader
              $height={largeHeader ? "lg" : "md"}
              start={<span>Middle header</span>}
            />
            <ShellSidebar
              $width="sm"
              $collapse={false}
              aria-label="Middle navigation"
              render={<nav />}
            >
              <a href="#nested-content" tabIndex={0}>
                Middle section
              </a>
            </ShellSidebar>
            <ShellMain $p={0}>
              <div className="h-40">Middle introduction</div>
              <Shell aria-label="Inner shell">
                <ShellHeader $height="lg" start={<span>Inner header</span>} />
                <ShellSidebar
                  $width="xs"
                  $collapse={false}
                  aria-label="Inner navigation"
                  render={<nav />}
                >
                  <a href="#nested-content" tabIndex={0}>
                    Inner section
                  </a>
                </ShellSidebar>
                <ShellMain>
                  <div id="nested-content" className="grid gap-4">
                    <label>
                      <input
                        type="checkbox"
                        checked={largeHeader}
                        onChange={(event) =>
                          setLargeHeader(event.currentTarget.checked)
                        }
                      />{" "}
                      Taller middle header
                    </label>
                    <Button onClick={() => setOverlay(true)}>
                      Open overlay
                    </Button>
                    <Button onClick={() => setUpdates(updates + 1)}>
                      Add update
                    </Button>
                    <p aria-live="polite">Updates: {updates}</p>
                    {Array.from({ length: updates }, (_, index) => (
                      <p key={index}>Update {index + 1} added to the page.</p>
                    ))}
                  </div>
                  <div className="h-[1200px]">Inner content</div>
                </ShellMain>
              </Shell>
              <div className="h-[1000px]">After the inner shell</div>
            </ShellMain>
          </Shell>
          <div className="h-[1000px]">After the middle shell</div>
        </ShellMain>
      </Shell>
      {overlay &&
        createPortal(
          <div
            role="dialog"
            aria-label="Shell overlay"
            className="fixed inset-0 flex items-center justify-center bg-white"
          >
            <Button onClick={() => setOverlay(false)}>Close overlay</Button>
          </div>,
          document.body,
        )}
    </>
  );
}
