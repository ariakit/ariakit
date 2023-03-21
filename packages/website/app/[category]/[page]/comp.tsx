"use client";
import { ReactNode, Suspense, use, useEffect, useState, version } from "react";
import { PortalContext } from "@ariakit/react";
// import deps from "website/pages.deps";
import { getPageName } from "scripts/pages/get-page-name.mjs";
import examples from "website/pages.examples.js";

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

let page2 = "";
let cache2 = Promise<any>;

function importPage(page: string) {
  if (page2 === page && cache2) {
    return cache2;
  }
  const promise = examples[page] ? examples[page]() : Promise.resolve(null);
  page2 = page;
  cache2 = promise;
  return promise;
}

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
  // console.log(page2);
  // if (!page2) return null;
  const Component = examples[page];
  const className = `page-${getPageName(page)}`;
  return (
    <div className={className}>
      <PlaygroundPortal className={className}>
        {Component && (
          <Suspense fallback={<div>Loading...</div>}>
            <Component />
          </Suspense>
        )}
      </PlaygroundPortal>
    </div>
  );
}
