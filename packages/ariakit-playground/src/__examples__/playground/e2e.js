import "expect-puppeteer";

const URL = `${process.env.URL || "http://localhost:3000"}/examples/playground`;

beforeAll(async () => {
  await page.goto(URL);
});

test('should be titled "Google"', async () => {
  await expect(page.title()).resolves.toMatch("");
});
