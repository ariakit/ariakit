declare module "markdown-to-jsx" {
  import * as React from "react";

  type Overrides = {
    [key: string]:
      | React.ComponentType<any>
      | {
          component: React.ComponentType<any>;
          props: Record<string, any>;
        };
  };

  type ParsingOptions = {
    forceBlock?: boolean;
    forceInline?: boolean;
    overrides?: Overrides;
    createElement?: typeof React.createElement;
    slugify?: (str: string) => string;
  };

  export function compiler(
    markdown: string,
    options?: ParsingOptions
  ): React.ReactElement<any>;

  export default function Markdown(props: {
    children: string;
    options?: ParsingOptions;
  }): React.ReactElement<any>;
}
