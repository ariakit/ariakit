export type Framework = "react" | "solid" | "svelte" | "vue" | "preact";

export interface Source {
  name: string;
  files: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}
