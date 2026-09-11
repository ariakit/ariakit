/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import "./style.css";
import * as React from "react";
import type { GalleryPageId } from "./pages.ts";
import { getGalleryPage, parseGalleryHash } from "./pages.ts";
import BadgePage from "./pages/badge.react.tsx";
import ButtonFixturesPage from "./pages/button-fixtures.react.tsx";
import ButtonPage from "./pages/button.react.tsx";
import CheckboxFixturesPage from "./pages/checkbox-fixtures.react.tsx";
import CheckboxPage from "./pages/checkbox.react.tsx";
import CodePage from "./pages/code.react.tsx";
import ComboboxFixturesPage from "./pages/combobox-fixtures.react.tsx";
import ComboboxPage from "./pages/combobox.react.tsx";
import DialogPage from "./pages/dialog.react.tsx";
import DisclosureFixturesPage from "./pages/disclosure-fixtures.react.tsx";
import DisclosurePage from "./pages/disclosure.react.tsx";
import HeadingPage from "./pages/heading.react.tsx";
import InputPage from "./pages/input.react.tsx";
import KbdPage from "./pages/kbd.react.tsx";
import LayerFixturesPage from "./pages/layer-fixtures.react.tsx";
import LinkPage from "./pages/link.react.tsx";
import ListFixturesPage from "./pages/list-fixtures.react.tsx";
import ListPage from "./pages/list.react.tsx";
import NavFixturesPage from "./pages/nav-fixtures.react.tsx";
import NavPage from "./pages/nav.react.tsx";
import OverviewPage from "./pages/overview.react.tsx";
import PopoverPage from "./pages/popover.react.tsx";
import ProgressFixturesPage from "./pages/progress-fixtures.react.tsx";
import ProgressPage from "./pages/progress.react.tsx";
import ProsePage from "./pages/prose.react.tsx";
import RadioPage from "./pages/radio.react.tsx";
import SeparatorPage from "./pages/separator.react.tsx";
import TableFixturesPage from "./pages/table-fixtures.react.tsx";
import TablePage from "./pages/table.react.tsx";
import TabsFixturesPage from "./pages/tabs-fixtures.react.tsx";
import TabsPage from "./pages/tabs.react.tsx";
import TooltipPage from "./pages/tooltip.react.tsx";
import { GalleryShell } from "./shell.react.tsx";

const pageComponents = {
  heading: HeadingPage,
  prose: ProsePage,
  separator: SeparatorPage,
  code: CodePage,
  kbd: KbdPage,
  link: LinkPage,
  button: ButtonPage,
  badge: BadgePage,
  input: InputPage,
  checkbox: CheckboxPage,
  radio: RadioPage,
  combobox: ComboboxPage,
  tabs: TabsPage,
  disclosure: DisclosurePage,
  nav: NavPage,
  list: ListPage,
  table: TablePage,
  progress: ProgressPage,
  popover: PopoverPage,
  dialog: DialogPage,
  tooltip: TooltipPage,
  "button-fixtures": ButtonFixturesPage,
  "checkbox-fixtures": CheckboxFixturesPage,
  "combobox-fixtures": ComboboxFixturesPage,
  "disclosure-fixtures": DisclosureFixturesPage,
  "layer-fixtures": LayerFixturesPage,
  "list-fixtures": ListFixturesPage,
  "nav-fixtures": NavFixturesPage,
  "progress-fixtures": ProgressFixturesPage,
  "table-fixtures": TableFixturesPage,
  "tabs-fixtures": TabsFixturesPage,
} satisfies Record<GalleryPageId, React.ComponentType>;

// The page of the last route hash. A hash that is not a route, such as the
// placeholder link of an example, leaves the page as it is.
let currentPageId: GalleryPageId | undefined;

function getCurrentPageId() {
  const pageId = parseGalleryHash(location.hash);
  if (pageId !== null) {
    currentPageId = pageId;
  }
  return currentPageId;
}

function subscribeToHash(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

/**
 * The page that the location hash selects. The server cannot read the hash, so
 * it renders the overview. Hydration renders the overview too, to match, and
 * the hash page replaces it in the next commit, after the preview is marked as
 * hydrated.
 */
function useGalleryPageId() {
  return React.useSyncExternalStore(
    subscribeToHash,
    getCurrentPageId,
    () => undefined,
  );
}

export default function AriakitUiGallery() {
  const pageId = useGalleryPageId();
  const Page = pageId ? pageComponents[pageId] : OverviewPage;

  React.useEffect(() => {
    const page = pageId ? getGalleryPage(pageId) : undefined;
    document.title = page ? `Ariakit UI: ${page.title}` : "Ariakit UI";
    // A new page starts at the top, as it would after a document navigation.
    window.scrollTo(0, 0);
  }, [pageId]);

  return (
    <GalleryShell pageId={pageId}>
      <Page />
    </GalleryShell>
  );
}
