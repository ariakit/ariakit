// Based on https://github.com/floating-ui/floating-ui/blob/1201e72e67a80e479122293d46d96c9bbc8f156d/packages/react-dom-interactions/src/FloatingOverlay.tsx
import { useSafeLayoutEffect } from "@ariakit/react-utils";
import { getDocument, getWindow, chain, isApple, isMac } from "@ariakit/utils";
import { useEffect } from "react";
import { assignStyle, setCSSProperty } from "./orchestrate.ts";
import { useRootDialog } from "./use-root-dialog.ts";

// Only iOS doesn't respect `overflow: hidden` on document.body.
const isIOS = isApple() && !isMac();

// The CSS global isn't part of the Window type, even though browsers expose
// it on every window object.
interface WindowWithCSS extends Window {
  CSS?: Pick<typeof CSS, "supports">;
}

export function supportsScrollbarGutter(win: Window) {
  const { CSS } = win as WindowWithCSS;
  return !!CSS?.supports("scrollbar-gutter", "stable");
}

function getPaddingProperty(documentElement: HTMLElement) {
  // RTL <body> scrollbar
  const documentLeft = documentElement.getBoundingClientRect().left;
  const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft;
  return scrollbarX ? "paddingLeft" : "paddingRight";
}

export function usePreventBodyScroll(
  contentElement: HTMLElement | null,
  contentId?: string,
  enabled?: boolean,
) {
  const isRootDialog = useRootDialog({
    attribute: "data-dialog-prevent-body-scroll",
    contentElement,
    contentId,
    enabled,
  });

  // Lock the scroll in the layout phase so the layout reads below (viewport
  // width, scrollbar position) run during the commit, where layout is being
  // computed anyway. As a passive effect, those reads ran after other effects
  // had already written styles, forcing an extra synchronous layout on every
  // open. This also locks the scroll before the dialog is first painted. On
  // iOS, the lock stays in the passive phase: its scroll position bookkeeping
  // (capture on lock, scrollTo on unlock) depends on the passive timing
  // relative to the dialog's focus effects. The hook choice is stable because
  // isIOS never changes within a session.
  const useLockEffect = isIOS ? useEffect : useSafeLayoutEffect;

  useLockEffect(() => {
    if (!isRootDialog()) return;
    if (!contentElement) return;
    const doc = getDocument(contentElement);
    const win = getWindow(contentElement);
    const { documentElement, body } = doc;

    // Under the padding lock below, the scrollbar is already gone, so
    // re-measuring while locked would yield 0. Read the width the first lock
    // stored instead. The gutter lock has the same problem, covered by the
    // computed scrollbar-gutter check in setStyle.
    const cssScrollbarWidth =
      documentElement.style.getPropertyValue("--scrollbar-width");
    const scrollbarWidth = cssScrollbarWidth
      ? Number.parseInt(cssScrollbarWidth, 10)
      : win.innerWidth - documentElement.clientWidth;

    const setStyle = () => {
      const computedStyle = win.getComputedStyle(documentElement);
      // The gutter may already be reserved, either because the page sets
      // scrollbar-gutter itself or because a previous gutter lock is still in
      // place when a remount re-locks before the deferred restore below runs
      // (StrictMode). The scrollbar measures 0 in both states (clientWidth
      // includes the reserved gutter), so check the computed style, like the
      // --scrollbar-width read above, to keep such locks on the gutter
      // branch. The computed value also carries author keywords such as
      // both-edges that the lock must preserve.
      const scrollbarGutter =
        computedStyle.getPropertyValue("scrollbar-gutter");
      const hasGutter = scrollbarGutter.includes("stable");
      // When the html overflow isn't visible, the page scrolls through the
      // html element itself and the body overflow doesn't propagate to the
      // viewport, so hiding the body overflow alone wouldn't lock the page
      // scroll. See https://github.com/ariakit/ariakit/issues/4345
      const isOverflowVisible = (value: string) =>
        // happy-dom and jsdom return an empty string for unset computed
        // values, whereas browsers return the visible keyword.
        !value || value === "visible";
      const htmlScrolls =
        !isOverflowVisible(computedStyle.getPropertyValue("overflow-x")) ||
        !isOverflowVisible(computedStyle.getPropertyValue("overflow-y"));
      // Hide the html overflow through the longhands so the restore keeps
      // inline longhands the page set itself, such as overflow-y: scroll.
      // Setting the overflow shorthand would overwrite and then drop them.
      const hideHtmlOverflow = () =>
        chain(
          setCSSProperty(documentElement, "overflow-x", "hidden"),
          setCSSProperty(documentElement, "overflow-y", "hidden"),
        );
      const withHiddenHtmlOverflow = (restoreStyle: () => void) => {
        if (!htmlScrolls) return restoreStyle;
        return chain(restoreStyle, hideHtmlOverflow());
      };
      // Without a space-consuming scrollbar (overlay scrollbars, page that
      // doesn't overflow), hiding the overflow can't shift the layout, so no
      // compensation is needed.
      if (!hasGutter && !scrollbarWidth) {
        return withHiddenHtmlOverflow(
          assignStyle(body, { overflow: "hidden" }),
        );
      }
      // Keep the scrollbar's space reserved while the hidden overflow removes
      // the scrollbar itself, so neither in-flow content nor `position:
      // fixed` elements shift. `scrollbar-gutter` must be set on the html
      // element: it applies to the viewport from there and doesn't propagate
      // from body. Set the properties individually so the restore doesn't
      // clobber unrelated inline styles (such as theme variables) written to
      // html while the dialog is open.
      if (hasGutter || supportsScrollbarGutter(win)) {
        return chain(
          setCSSProperty(
            documentElement,
            "scrollbar-gutter",
            hasGutter ? scrollbarGutter : "stable",
          ),
          hideHtmlOverflow(),
        );
      }
      // Fallback for browsers without scrollbar-gutter support (Safari <
      // 18.2): compensate the removed scrollbar with body padding and expose
      // --scrollbar-width so userland position: fixed elements can compensate
      // too.
      return withHiddenHtmlOverflow(
        chain(
          setCSSProperty(
            documentElement,
            "--scrollbar-width",
            `${scrollbarWidth}px`,
          ),
          assignStyle(body, {
            overflow: "hidden",
            [getPaddingProperty(documentElement)]: `${scrollbarWidth}px`,
          }),
        ),
      );
    };

    // Only iOS doesn't respect `overflow: hidden` on document.body
    const setIOSStyle = () => {
      const { scrollX, scrollY, visualViewport } = win;

      // iOS 12 does not support `visuaViewport`.
      const offsetLeft = visualViewport?.offsetLeft ?? 0;
      const offsetTop = visualViewport?.offsetTop ?? 0;

      const restoreStyle = assignStyle(body, {
        position: "fixed",
        overflow: "hidden",
        top: `${-(scrollY - Math.floor(offsetTop))}px`,
        left: `${-(scrollX - Math.floor(offsetLeft))}px`,
        right: "0",
        [getPaddingProperty(documentElement)]: `${scrollbarWidth}px`,
      });

      return () => {
        restoreStyle();
        // istanbul ignore next: JSDOM doesn't implement window.scrollTo
        if (process.env.NODE_ENV !== "test") {
          win.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
        }
      };
    };

    if (isIOS) return setIOSStyle();

    const restore = setStyle();

    return () => {
      // Defer the restore to a microtask so it runs after this commit's
      // layout effects, such as the dialog's focus-on-hide. This preserves
      // the close ordering the passive phase provided before: focus first
      // (while the scroll is still locked), then unlock. The orchestrate
      // stacks keep this safe if the scroll gets locked again in between.
      queueMicrotask(restore);
    };
  }, [isRootDialog, contentElement]);
}
