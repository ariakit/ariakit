"use client";

import type { ReactNode } from "react";
import { Suspense, useEffect, useState } from "react";
import { PortalContext } from "@ariakit/react";
import examples from "build-pages/examples.js";

interface PortalProviderProps {
  children: ReactNode;
  id: string;
}

function PortalProvider({ children, id }: PortalProviderProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.createElement("div");
    root.className = id;
    document.body.appendChild(root);
    setPortalRoot(root);
    return () => {
      root.remove();
    };
  }, [id]);

  return (
    <PortalContext.Provider value={portalRoot}>
      {children}
    </PortalContext.Provider>
  );
}

interface Props {
  path: string;
  id?: string;
  css?: string;
}

export function Preview({ path, id, css }: Props) {
  const Component = examples[path];
  const preview = Component && <Component />;
  return (
    <Suspense>
      {id ? <PortalProvider id={id}>{preview}</PortalProvider> : preview}
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
    </Suspense>
  );
}
