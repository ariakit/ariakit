import { basename } from "path";

export function navigateToExamplePage(dirname: string) {
  const exampleName = basename(dirname);
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const url = `${baseUrl}/examples/${exampleName}`;
  beforeAll(() => page.goto(url));
}
