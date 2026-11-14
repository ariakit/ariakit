import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("hides an avatar without a label from assistive technology", async ({
    q,
  }) => {
    const avatar = query(q.article("Default")).text("HK");
    await test.expect(avatar).toHaveAttribute("aria-hidden", "true");
    await test.expect(avatar).not.toHaveAttribute("role");
  });

  test("exposes a labelled avatar as one image", async ({ q }) => {
    const avatar = query(q.article("Labelled avatar")).img("Hana Kobayashi");
    await test.expect(avatar).toHaveText("HK");
    await test.expect(avatar).not.toHaveAttribute("aria-hidden");
  });

  test("keeps the link role of an avatar that renders a link", async ({
    q,
  }) => {
    const link = query(q.article("Link avatar")).link("Hana Kobayashi");
    await test.expect(link).toHaveAttribute("href", "#hana");
    await test.expect(link).not.toHaveAttribute("aria-hidden");
  });

  test("gives a labelled group the group role", async ({ q }) => {
    const group = query(q.article("Group")).group("Project members");
    await test.expect(query(group).img()).toHaveCount(5);
    await test.expect(query(group).img("3 more members")).toHaveText("+3");
  });

  // The photo is in the server HTML and fails before the page hydrates, so no
  // error event reaches the image.
  test("keeps the initials when the photo fails before hydration", async ({
    q,
  }) => {
    const avatar = query(q.article("Failed photo")).img("Noah Patel");
    await test.expect(avatar).toHaveText("NP");
    // The photo is decorative, so it has no role to query.
    await test.expect(avatar.locator("img")).toHaveCount(0);
  });

  test("follows the photo source after a failure", async ({ q }) => {
    const box = query(q.article("Photo source"));
    const avatar = box.img("Maya Rivera");
    const working = box.button("Working photo");
    // The photo is decorative, so it has no role to query.
    const photo = avatar.locator("img");
    await test.expect(photo).toHaveCount(0);
    await working.click();
    await test.expect(photo).toHaveJSProperty("complete", true);
    await test.expect(photo).not.toHaveJSProperty("naturalWidth", 0);
    // A new missing source fails after the image mounts, so the error event
    // removes the photo.
    await working.click();
    await test.expect(photo).toHaveCount(0);
    await test.expect(avatar).toHaveText("MR");
  });

  test("follows the photo source set after a failure", async ({ q }) => {
    const box = query(q.article("Photo source set"));
    const avatar = box.img("Owen Walsh");
    // The photo is decorative, so it has no role to query.
    const photo = avatar.locator("img");
    await test.expect(photo).toHaveCount(0);
    await box.button("Working photo set").click();
    await test.expect(photo).toHaveJSProperty("complete", true);
    await test.expect(photo).not.toHaveJSProperty("naturalWidth", 0);
  });

  test("renders the photo in the server HTML", async ({ page }) => {
    const response = await page.request.get(page.url());
    const html = await response.text();
    test
      .expect(html)
      .toMatch(/<span[^>]*aria-label="Maya Rivera"[^>]*><img\b[^>]*src="data:/);
  });
});
