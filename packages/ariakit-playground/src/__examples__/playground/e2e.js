beforeAll(async () => {
  await page.goto("http://localhost:3000/examples/playground");
});

test('should be titled "Google"', async () => {
  await expect(page.title()).resolves.toMatch("");
});
