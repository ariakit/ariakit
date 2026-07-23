import { Button } from "@ariakit/ui/ariakit/button.react.tsx";
import { clsx } from "clsx";
import { forwardRef, useMemo } from "react";
import { Icon } from "#app/icons/icon.react.tsx";
import { getFramework } from "#app/lib/frameworks.ts";
import type { Framework } from "#app/lib/schemas.ts";
import type { Source } from "#app/lib/source.ts";
import type { AppStackblitzFramework } from "#app/lib/stackblitz.ts";
import { openInStackblitz } from "#app/lib/stackblitz.ts";

export interface CodeBlockEditProps extends React.ComponentPropsWithRef<"button"> {
  source?: Source;
  framework?: Framework;
  example?: string;
  stackblitzFramework?: AppStackblitzFramework | null;
}

export function getStackblitzFramework(
  framework?: Framework,
  source?: Source,
): AppStackblitzFramework | null {
  if (!framework || !source) return null;
  // Generated projects can't install @ariakit/ui until the package
  // publishes (see the distribution TODO in app/src/lib/stackblitz.ts), so
  // sources that depend on it have no viable target instead of producing a
  // project whose install fails.
  if (Object.hasOwn(source.dependencies, "@ariakit/ui")) return null;
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
      <Button
        {...props}
        ref={ref}
        type="button"
        // Square icon button: pin the size and drop the field padding like
        // the legacy square button. The pinned height defeats the button's
        // line-box centering, so center the icon explicitly. Legacy plain
        // ak-button paints no idle layer offset.
        $p="none"
        $lightnessOffset={false}
        className={clsx("size-10 items-center", className)}
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
      </Button>
    );
  },
);
