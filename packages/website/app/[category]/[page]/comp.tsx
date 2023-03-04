"use client";
import { ReactNode, use, useEffect, useState, version } from "react";
import { PortalContext } from "@ariakit/react";
// import deps from "website/pages.deps";
// import examples from "website/pages.examples";

// interface CompProps {
//   imports: Array<keyof typeof deps>;
//   page: string;
//   value?: string;
// }

// const cache = new WeakMap<Array<keyof typeof deps>, Promise<any[]>>();

// function importAll(imports: Array<keyof typeof deps>) {
//   if (cache.has(imports)) return cache.get(imports)!;
//   const promise = Promise.all(imports.map((dep) => deps[dep]()));
//   cache.set(imports, promise);
//   return promise;
// }

const page2 = "";
const cache2 = Promise<any>;

// function importPage(page: string) {
//   if (page2 === page && cache2) {
//     return cache2;
//   }
//   const promise = examples[page] ? examples[page]() : Promise.resolve(null);
//   page2 = page;
//   cache2 = promise;
//   return promise;
// }

type PlaygroundPortalProps = {
  children: ReactNode;
  className?: string;
};

function PlaygroundPortal({ children, className }: PlaygroundPortalProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.createElement("div");
    if (className) {
      root.className = className;
    }
    document.body.appendChild(root);
    setPortalRoot(root);
    return () => {
      root.remove();
    };
  }, [className]);

  return (
    <PortalContext.Provider value={portalRoot}>
      {children}
    </PortalContext.Provider>
  );
}

export default function Comp({ imports, page, value }) {
  // export default function Comp({ imports, page, value }: CompProps) {
  // const deps2 = use(importAll(imports));
  // const page2 = use(importPage(page));
  // console.log(page2);
  return null;
  if (!page2) return null;
  const Component = page2.default;
  return (
    <div className={`${page}1`}>
      <PlaygroundPortal className={`${page}1`}>
        <Component />
      </PlaygroundPortal>
    </div>
  );
}
