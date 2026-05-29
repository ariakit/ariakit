"use client";

import { PortalContext } from "@ariakit/react";
import type { ReactNode } from "react";
import { Suspense, useEffect, useState } from "react";
import { createComponent } from "solid-js";
import { render } from "solid-js/web";
import examples from "@/build-pages/examples.ts";
import { Spinner } from "@/icons/spinner.tsx";
import { SolidPreviewContent } from "./preview.solid.tsx";

const ignoredExampleIds = ["examples-menu-wordpress-modal"];

interface PortalProviderProps {
  children: ReactNode;
  id: string;
}

function PortalProvider({ children, id }: PortalProviderProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (ignoredExampleIds.includes(id)) {
      document.body.classList.add(id);
      return () => {
        document.body.classList.remove(id);
      };
    }
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
    <Suspense fallback={<Spinner className="size-8 animate-spin" />}>
      {id ? <PortalProvider id={id}>{preview}</PortalProvider> : preview}
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
    </Suspense>
  );
}

export function SolidPreview(props: Props) {
  useEffect(
    () =>
      render(
        () => createComponent(SolidPreviewContent as any, props),
        document.querySelector("[data-preview-render-target]")!,
      ),
    [],
  );
  return null;
}
