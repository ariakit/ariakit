/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { invariant } from "@ariakit/core/utils/misc";
import * as ak from "@ariakit/react";
import { QueryClient, useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import * as React from "react";
import type { ReferenceLabelProps } from "#app/components/reference-label.react.tsx";
import { getReferenceLabelColors } from "#app/components/reference-label.react.tsx";
import { getPortalRoot } from "#app/lib/get-portal-root.ts";
import { trimRight } from "#app/lib/string.ts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

async function fetchPartialPath(partialPath: string | null) {
  invariant(partialPath, "No partial path");
  const response = await fetch(partialPath);
  if (response.status !== 200) {
    throw new Error(`Failed to load ${partialPath}`);
  }
  return response.text();
}

function getQueryKey(partialPath: string | null) {
  return ["reference-partial", partialPath];
}

function getPartialPathFromAnchor(
  anchor: HTMLElement | HTMLAnchorElement | null,
) {
  if (!anchor) return null;
  if (!("href" in anchor)) return null;
  try {
    const url = new URL(anchor.href, window.location.href);
    const hash = url.hash.replace("#api", "");
    const pathWithHash = `${trimRight(url.pathname, "/")}/${hash}`;
    const partialPath = `/partials${pathWithHash.replace("#", "")}`;
    return partialPath;
  } catch {
    return null;
  }
}

export interface ReferenceHovercardAnchorProps extends ak.HovercardAnchorProps {
  inHovercard?: boolean;
  inCodeBlock?: boolean;
  kind?: ReferenceLabelProps["kind"];
}

export function ReferenceHovercardAnchor({
  inHovercard,
  inCodeBlock,
  kind,
  className,
  children,
  ...props
}: ReferenceHovercardAnchorProps) {
  const prefetchRef = React.useRef(false);

  const labelColors =
    kind && !inCodeBlock ? getReferenceLabelColors(kind) : null;

  return (
    <ak.HovercardProvider
      placement={inHovercard ? "right" : "bottom"}
      timeout={300}
      hideTimeout={150}
    >
      <ak.HovercardAnchor
        {...props}
        style={labelColors?.style}
        className={clsx(
          "ak-link not-hover:decoration-dashed decoration-0 in-inert:no-underline",
          labelColors?.className,
          inCodeBlock && "text-inherit",
          className,
        )}
        showOnHover={(event) => {
          const partialPath = getPartialPathFromAnchor(event.currentTarget);
          if (!partialPath) return false;
          if (prefetchRef.current) return true;
          prefetchRef.current = true;
          queryClient.prefetchQuery({
            queryKey: getQueryKey(partialPath),
            queryFn: () => fetchPartialPath(partialPath),
          });
          return true;
        }}
      >
        {inCodeBlock ? (
          children
        ) : (
          <code className="text-inherit!">{children}</code>
        )}
      </ak.HovercardAnchor>
      <ReferenceHovercard inHovercard={inHovercard} />
    </ak.HovercardProvider>
  );
}

export interface ReferenceHovercardProps extends ak.HovercardProps {
  inHovercard?: boolean;
}

export function ReferenceHovercard({
  className,
  inHovercard,
  ...props
}: ReferenceHovercardProps) {
  const store = ak.useHovercardContext();
  const open = ak.useStoreState(store, "mounted");
  const anchorElement = ak.useStoreState(store, "anchorElement");

  const partialPath = React.useMemo(() => {
    if (!anchorElement) return null;
    return getPartialPathFromAnchor(anchorElement);
  }, [anchorElement]);

  React.useEffect(() => {
    const hide = () => {
      store?.hide();
    };
    document.addEventListener("astro:before-preparation", hide);
    return () => {
      document.removeEventListener("astro:before-preparation", hide);
    };
  }, [store]);

  const { data, error } = useQuery(
    {
      enabled: open,
      queryKey: getQueryKey(partialPath),
      queryFn: () => fetchPartialPath(partialPath),
    },
    queryClient,
  );

  React.useEffect(() => {
    if (!error) return;
    store?.hide();
  }, [error, store]);

  const portalElement = React.useCallback(
    (element: HTMLElement) => {
      if (!inHovercard) return getPortalRoot(element);
      return element.closest<HTMLElement>("[data-dialog]") || null;
    },
    [inHovercard],
  );

  return (
    <ak.Hovercard
      store={store}
      arrowPadding={10}
      unmountOnHide
      overlap
      portal
      portalElement={portalElement}
      {...props}
      className={clsx(
        "ak-popover ak-edge/15 data-open:ak-popover_open origin-(--popover-transform-origin) ak-frame-force-dialog/0",
        inHovercard && "ak-layer-(--ak-layer-parent)",
        className,
      )}
    >
      <ak.HovercardArrow />
      <div className="ak-frame-cover/0 ak-frame-cover-start ak-frame-cover-end overflow-clip">
        <div
          className={clsx(
            "overflow-y-auto overscroll-contain w-124 @container",
            inHovercard
              ? "max-h-[min(calc(100dvh*0.5),32rem)]"
              : "max-h-[min(calc(100dvh*0.4),32rem)]",
          )}
        >
          {data ? (
            <div dangerouslySetInnerHTML={{ __html: data }} />
          ) : (
            <div className="ak-prose ak-frame/2 animate-pulse">
              <div className="ak-layer-pop-2 w-32 h-7 ak-frame"></div>
              <div className="flex flex-col gap-3">
                <div className="ak-layer-pop w-full h-4 rounded-sm"></div>
                <div className="ak-layer-pop w-full h-4 rounded-sm"></div>
                <div className="ak-layer-pop w-1/3 h-4 rounded-sm"></div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="ak-layer-pop w-full h-4 rounded-sm"></div>
                <div className="ak-layer-pop w-1/2 h-4 rounded-sm"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ak.Hovercard>
  );
}
