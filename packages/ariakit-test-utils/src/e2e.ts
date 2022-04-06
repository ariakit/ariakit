export function navigateToExamplePage(dirname: string) {
  const exampleName = dirname.replace(/^.*\/(.+)$/, "$1");
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const url = `${baseUrl}/examples/${exampleName}`;
  beforeAll(() => page.goto(url));
}
