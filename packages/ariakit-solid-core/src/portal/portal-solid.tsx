import {
  type JSX,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  getOwner,
  onCleanup,
  runWithOwner,
  sharedConfig,
} from "solid-js";
import { insert } from "solid-js/web";

/**
 * Renders components somewhere else in the DOM
 *
 * Useful for inserting modals and tooltips outside of an cropping layout. If no mount point is given, the portal is inserted in document.body; it is wrapped in a `<div>` unless the target is document.head or `isSVG` is true. setting `useShadow` to true places the element in a shadow root to isolate styles.
 *
 * @description https://docs.solidjs.com/reference/components/portal
 */
export function Portal<S extends boolean = false>(props: {
  mount?: Node;
  ref?:
    | (S extends true ? SVGGElement : HTMLDivElement)
    | ((el: HTMLDivElement) => void);
  children: JSX.Element;
}) {
  const marker = document.createTextNode("");
  const mount = () => props.mount || document.body;
  const owner = getOwner();
  let content: undefined | (() => JSX.Element);
  let hydrating = !!sharedConfig.context;

  createEffect(
    () => {
      // basically we backdoor into a sort of renderEffect here
      if (hydrating) (getOwner() as any).user = hydrating = false;
      content ||
        (content = runWithOwner(owner, () => createMemo(() => props.children)));
      const el = mount();
      if (el instanceof HTMLHeadElement) {
        const [clean, setClean] = createSignal(false);
        const cleanup = () => setClean(true);
        createRoot((dispose) =>
          insert(el, () => (!clean() ? content!() : dispose()), null),
        );
        onCleanup(cleanup);
      } else {
        const container = document.createElement("div");

        Object.defineProperty(container, "_$host", {
          get() {
            return marker.parentNode;
          },
          configurable: true,
        });
        insert(container, content);
        el.appendChild(container);
        props.ref && (props as any).ref(container);
        onCleanup(() => el.removeChild(container));
      }
    },
    undefined,
    { render: !hydrating },
  );
  return marker;
}
