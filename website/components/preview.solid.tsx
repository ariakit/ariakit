// TODO: commented out code will need to be implemented in time.

// import { Spinner } from "@/icons/spinner.tsx";
// import { PortalContext } from "@ariakit/solid";
// import { createEffect, createSignal } from "solid-js";
import { Suspense } from "solid-js/web";
import examples from "@/build-pages/examples.ts";

// const ignoredExampleIds = ["examples-menu-wordpress-modal"];

// interface PortalProviderProps {
//   children: JSX.Element;
//   id: string;
// }

// function PortalProvider(props: PortalProviderProps) {
//   const [portalRoot, setPortalRoot] = createSignal<HTMLElement | null>(null);

//   createEffect(() => {
//     const $id = props.id;
//     if (ignoredExampleIds.includes($id)) {
//       document.body.classList.add($id);
//       return () => {
//         document.body.classList.remove($id);
//       };
//     }
//     const root = document.createElement("div");
//     root.className = $id;
//     document.body.appendChild(root);
//     setPortalRoot(root);
//     return () => {
//       root.remove();
//     };
//   });

//   return (
//     // TODO: maybe context will pass signal directly instead?
//     <PortalContext.Provider value={portalRoot()}>
//       {props.children}
//     </PortalContext.Provider>
//   );
// }

interface Props {
  path: string;
  id?: string;
  css?: string;
}

export function SolidPreviewContent(props: Props) {
  const Component = examples[props.path];
  if (!Component) throw new Error(`Component not found: ${props.path}`);
  return (
    <>
      {/* <Suspense fallback={<Spinner className="size-8 animate-spin" />}> */}
      {/* @ts-ignore */}
      <Suspense fallback={<div>Loading...</div>}>
        {/* @ts-ignore */}
        <Component />
        {/* <Test /> */}
      </Suspense>
      {/* @ts-ignore */}
      {props.css && <style innerHTML={props.css} />}
    </>
  );
}
