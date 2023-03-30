"use client";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { PortalContext } from "@ariakit/react";
import examples from "website/build-pages/examples.js";

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

interface PageExampleProps {
  path: string;
  id?: string;
  css?: string;
}

export default function PageExample({ path, id, css }: PageExampleProps) {
  const Component = examples[path];
  const preview = Component && <Component />;
  return (
    <div className={id}>
      {id ? <PortalProvider id={id}>{preview}</PortalProvider> : preview}
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
    </div>
  );
}
