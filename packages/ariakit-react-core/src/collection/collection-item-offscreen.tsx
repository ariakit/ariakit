import { invariant } from "@ariakit/core/utils/misc";
import type { ElementType, RefCallback, RefObject } from "react";
import { useCallback, useRef, useState } from "react";
import { Role } from "../role/role.tsx";
import { useForceUpdate, useId, useMergeRefs } from "../utils/hooks.ts";
import { forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import * as Base from "./collection-item.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function requestIdleCallback(callback: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    return window.requestIdleCallback(callback);
  }
  callback();
  return 0;
}

function cancelIdleCallback(id: number) {
  if (typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(id);
  }
}

export function useCollectionItemOffscreen<
  T extends ElementType,
  P extends CollectionItemProps<T>,
>({ offscreenBehavior = "active", offscreenRoot, ...props }: P) {
  const id = useId(props.id);
  const [updated, forceUpdate] = useForceUpdate();
  const forcedUpdatesCountRef = useRef(0);

  const [_active, setActive] = useState(offscreenBehavior === "active");
  const active = _active || offscreenBehavior === "active";

  const observerRef = useRef<IntersectionObserver | null>(null);
  const idleCallbackIdRef = useRef(0);

  const ref = useCallback<RefCallback<HTMLType>>(
    (element) => {
      if (!element || offscreenBehavior === "active") {
        cancelIdleCallback(idleCallbackIdRef.current);
        observerRef.current?.disconnect();
        return;
      }

      invariant(
        offscreenRoot !== undefined,
        process.env.NODE_ENV !== "production" &&
          "The offscreenRoot prop must provided.",
      );

      const getOffscreenRoot = () => {
        if (!offscreenRoot) return null;
        if (typeof offscreenRoot === "function") {
          return offscreenRoot(element);
        }
        if ("current" in offscreenRoot) {
          return offscreenRoot.current;
        }
        return offscreenRoot;
      };

      const root = getOffscreenRoot();

      if (!root) {
        forcedUpdatesCountRef.current++;
        if (forcedUpdatesCountRef.current > 3) {
          throw new Error(
            "The offscreenRoot is not available. Please make sure the root element is mounted.",
          );
        }
        forceUpdate();
        return;
      }

      if (!observerRef.current || observerRef.current.root !== root) {
        observerRef.current = new IntersectionObserver(
          ([entry]) => {
            cancelIdleCallback(idleCallbackIdRef.current);
            const isIntersecting = !!entry?.isIntersecting;
            idleCallbackIdRef.current = requestIdleCallback(() => {
              if (!isIntersecting && offscreenBehavior === "lazy") return;
              setActive(isIntersecting);
            });
          },
          { root, rootMargin: "40%" },
        );
      }

      observerRef.current.observe(element);
    },
    [updated, offscreenBehavior, offscreenRoot],
  );

  return {
    id,
    active,
    ref,
    "data-offscreen": !active || undefined,
  };
}

export const CollectionItem = forwardRef(function CollectionItem({
  offscreenBehavior,
  offscreenRoot,
  ...props
}: CollectionItemProps) {
  const { active, ref, ...rest } = useCollectionItemOffscreen({
    offscreenBehavior,
    offscreenRoot,
    ...props,
  });
  const allProps = { ...rest, ...props, ref: useMergeRefs(ref, props.ref) };
  if (active) {
    return <Base.CollectionItem {...allProps} />;
  }
  // Remove CompositeItem props
  const {
    store,
    shouldRegisterItem,
    getItem,
    // @ts-expect-error This prop may come from a collection renderer.
    element,
    ...htmlProps
  } = allProps;
  const Component = Role[TagName];
  return <Component {...htmlProps} />;
});

export interface CollectionItemOptions<T extends ElementType = TagName>
  extends Base.CollectionItemOptions<T> {
  offscreenBehavior?: "active" | "passive" | "lazy";
  offscreenRoot?:
    | HTMLElement
    | RefObject<HTMLElement | null>
    | ((element: HTMLElement) => HTMLElement | null)
    | null;
}

export type CollectionItemProps<T extends ElementType = TagName> = Props<
  T,
  CollectionItemOptions<T>
>;
