import clsx from "clsx";
import { forwardRef, useMemo } from "react";

import { Icon } from "#app/icons/icon.react.tsx";
import { getFramework } from "#app/lib/frameworks.ts";
import type { Framework } from "#app/lib/schemas.ts";
import type { Source } from "#app/lib/source.ts";
import type { SiteStackblitzFramework } from "#app/lib/stackblitz.ts";
import { openInStackblitz } from "#app/lib/stackblitz.ts";

export interface CodeBlockEditProps
  extends React.ComponentPropsWithRef<"button"> {
  source?: Source;
  framework?: Framework;
  example?: string;
  stackblitzFramework?: SiteStackblitzFramework | null;
}

export function getStackblitzFramework(
  framework?: Framework,
  source?: Source,
): SiteStackblitzFramework | null {
  if (!framework || !source) return null;
  const frameworkDetail = getFramework(framework);
  const indexFile =
    "indexFile" in frameworkDetail ? frameworkDetail.indexFile : null;
  if (!indexFile) return null;

  const hasNextDependency = Boolean(
    source.dependencies?.next || source.devDependencies?.next,
  );
  const hasNextFiles = Object.keys(source.files).some((filename) =>
    filename.startsWith("app/"),
  );

  if (indexFile.endsWith(".react.tsx")) {
    if (hasNextDependency || hasNextFiles) {
      return "react-nextjs";
    }
    return "react-vite";
  }

  if (indexFile.endsWith(".solid.tsx")) {
    return "solid-vite";
  }

  return null;
}

export const CodeBlockEdit = forwardRef<HTMLButtonElement, CodeBlockEditProps>(
  function CodeBlockEdit(
    {
      className,
      source,
      framework,
      example,
      stackblitzFramework: stackblitzFrameworkProp,
      children,
      disabled,
      ...props
    },
    ref,
  ) {
    const stackblitzFramework = useMemo(() => {
      if (stackblitzFrameworkProp !== undefined) return stackblitzFrameworkProp;
      return getStackblitzFramework(framework, source);
    }, [stackblitzFrameworkProp, framework, source]);

    const canOpen = Boolean(stackblitzFramework && source && framework);
    const isDisabled = disabled || !canOpen;

    return (
      <button
        {...props}
        ref={ref}
        type="button"
        className={clsx("ak-button ak-button-square-10", className)}
        disabled={isDisabled}
        onClick={(event) => {
          props.onClick?.(event);
          if (event.defaultPrevented) return;
          if (!stackblitzFramework) return;
          if (!framework) return;
          if (!source) return;
          const id = example ?? source.name;
          if (!id) return;
          openInStackblitz({
            id,
            files: Object.fromEntries(
              Object.entries(source.files).map(([key, value]) => [
                key,
                value.content,
              ]),
            ),
            dependencies: source.dependencies,
            devDependencies: source.devDependencies,
            styles: source.styles,
            framework: stackblitzFramework,
          });
        }}
      >
        {children ?? (
          <>
            <Icon name="edit" className="text-lg" />
            <span className="sr-only">Edit code</span>
          </>
        )}
      </button>
    );
  },
);
