import { afterEach, expect, test, vi } from "vitest";

const { openProjectMock, embedProjectMock } = vi.hoisted(() => ({
  openProjectMock: vi.fn(),
  embedProjectMock: vi.fn(),
}));

vi.mock("@stackblitz/sdk", () => ({
  default: {
    openProject: openProjectMock,
    embedProject: embedProjectMock,
  },
}));

import type { StackblitzProps } from "./stackblitz.ts";
import { openInStackblitz } from "./stackblitz.ts";

afterEach(() => {
  openProjectMock.mockReset();
  embedProjectMock.mockReset();
});

const templates: StackblitzProps["template"][] = ["vite", "next"];

test.each(templates)(
  "%s project uses bundler module resolution",
  (template) => {
    const props: StackblitzProps = {
      id: `${template}-tsconfig`,
      template,
      files: {
        "index.tsx":
          "export default function Example() { return <div>Example</div>; }\n",
      },
    };

    openInStackblitz(props);

    const [project] = openProjectMock.mock.calls[0] || [];

    expect(project.files["tsconfig.json"]).toContain(`"module": "esnext"`);
    expect(project.files["tsconfig.json"]).toContain(
      `"moduleResolution": "bundler"`,
    );
  },
);
