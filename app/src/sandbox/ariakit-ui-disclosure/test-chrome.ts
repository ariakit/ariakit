import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/7494#discussion_r3998773048
  test("keeps a bare fragment label separate from its description and badge", async ({
    q,
  }) => {
    const button = q.button("Account settings");
    await test
      .expect(button)
      .toHaveAccessibleDescription("Manage your profile");
    await test
      .expect(button.locator(":scope > .disclosure-button-slot"))
      .toHaveText("3");
    await button.click();
    await test.expect(q.text("Update account settings")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7478
  test("keeps a trailing badge beside the label", async ({ q }) => {
    const example = query(q.article("Trailing badge"));
    const button = example.button("Notifications 3");
    await test.expect(button.locator(":scope > span").nth(1)).toHaveText("3");
    await button.click();
    await test
      .expect(example.text("Three messages need your attention."))
      .toBeHidden();
    await button.press("Enter");
    await test
      .expect(example.text("Three messages need your attention."))
      .toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/7494#discussion_r3998666934
  test("keeps a consumer label component and description separate from the slots", async ({
    q,
  }) => {
    const example = query(q.article("Slots with description"));
    const button = example.button("Workspace members");
    await test
      .expect(button)
      .toHaveAttribute("aria-labelledby", "workspace-members-label");
    await test
      .expect(button)
      .toHaveAccessibleDescription("People with access to this workspace");
    await test.expect(button.locator(":scope > span").nth(2)).toHaveText("4");
    await button.click();
    await test
      .expect(example.text("Invite a teammate or change a role."))
      .toBeHidden();
  });

  // https://github.com/ariakit/ariakit/pull/7494#discussion_r3998666934
  test("accepts label props with fragment content and adjacent slots", async ({
    q,
  }) => {
    const button = q.button("Invitation details");
    await test
      .expect(button)
      .toHaveAttribute("aria-labelledby", "invitation-label");
    await test
      .expect(button)
      .toHaveAccessibleDescription("Review workspace invitations");
    await test.expect(button.locator(":scope > span").nth(2)).toHaveText("2");
    await button.click();
    await test.expect(q.text("Two invitations need review")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/7494#discussion_r3998666934
  test("renders a zero label and omits a false label without wrapping row children", async ({
    q,
  }) => {
    const button = q.button("0").filter({ hasText: "Pending invitations" });
    await test
      .expect(button)
      .toHaveAccessibleDescription("Pending invitations");
    await button.click();
    await test.expect(q.text("No invitations need review")).toBeVisible();
    const members = q.button("Show invited members");
    await test.expect(members).not.toHaveAttribute("aria-labelledby");
    await test
      .expect(members)
      .toHaveAccessibleDescription("Members waiting for access");
    await test
      .expect(members.locator(":scope > .disclosure-button-slot"))
      .toHaveCount(1);
  });

  test("shares the open state of a controlled disclosure with an outside button", async ({
    page,
    q,
  }) => {
    const example = query(q.article("Controlled"));
    const toggle = example.button("Toggle delivery details");
    const button = example.button("Delivery details");
    const text = example.text(
      "Standard delivery takes three to five business days.",
    );
    const contentId = await toggle.getAttribute("aria-controls");
    test.expect(contentId).toBeTruthy();
    await test.expect(button).toHaveAttribute("aria-controls", contentId ?? "");
    await test.expect(toggle).toHaveAttribute("aria-expanded", "false");
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    await test.expect(text).toBeHidden();

    await toggle.click();
    await test.expect(toggle).toHaveAttribute("aria-expanded", "true");
    await test.expect(button).toHaveAttribute("aria-expanded", "true");
    await test.expect(page.locator(`[id="${contentId}"]`)).toBeVisible();
    await test.expect(text).toBeVisible();

    await button.click();
    await test.expect(toggle).toHaveAttribute("aria-expanded", "false");
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    await test.expect(text).toBeHidden();
  });

  test("labels and describes a button that has both", async ({ q }) => {
    const button = query(q.article("Description")).button("Billing");
    await test
      .expect(button)
      .toHaveAccessibleDescription("Manage the cards on this account");
  });

  test("opens and closes group members independently", async ({ q }) => {
    const group = query(q.article("Group"));
    const change = group.button("Can I change my plan?");
    const refunds = group.button("Do you offer refunds?");
    await test.expect(change).toHaveAttribute("aria-expanded", "true");
    await test.expect(refunds).toHaveAttribute("aria-expanded", "false");
    await refunds.click();
    await test.expect(refunds).toHaveAttribute("aria-expanded", "true");
    await test.expect(change).toHaveAttribute("aria-expanded", "true");
    await test
      .expect(group.text("We refund any payment made in the last 30 days."))
      .toBeVisible();
  });

  // Regression fixtures.
  test.describe("disclosure button store", () => {
    for (const name of ["Project", "Team"]) {
      // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781692
      test(`keeps the ${name.toLowerCase()} button state in sync with its explicit store`, async ({
        q,
      }) => {
        const fixture = query(q.article("Disclosure button store"));
        const button = fixture.button(`${name} details`);
        await test.expect(button).toHaveAttribute("aria-expanded", "false");
        await test.expect(button).not.toHaveAttribute("data-open");
        await button.click();
        await test.expect(button).toHaveAttribute("aria-expanded", "true");
        await test.expect(button).toHaveAttribute("data-open", "true");
        await test
          .expect(fixture.text(`${name} details are available.`))
          .toBeVisible();
        await button.click();
        await test.expect(button).toHaveAttribute("aria-expanded", "false");
        await test.expect(button).not.toHaveAttribute("data-open");
        await test
          .expect(fixture.text(`${name} details are available.`))
          .not.toBeVisible();
      });
    }
  });

  test.describe("disclosure optional content", () => {
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974550076
    test("omits a false label while keeping the description", async ({ q }) => {
      const fixture = query(q.article("Disclosure optional content"));
      const button = fixture.button("Optional title");
      await test.expect(button).not.toHaveAttribute("aria-labelledby");
      // The description is the button's only content, so it names the button
      // and does not describe it with the same text again.
      await test.expect(button).toHaveAccessibleName("Optional title");
      await test.expect(button).not.toHaveAttribute("aria-describedby");
      await test.expect(button.locator("span[id]")).toHaveCount(1);
      await button.click();
      await test.expect(fixture.text("Optional settings")).toBeVisible();
    });

    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974549543
    test("renders a zero icon before the label and the default indicator", async ({
      q,
    }) => {
      const fixture = query(q.article("Disclosure optional content"));
      const button = fixture.button(/Unread messages$/);
      await test.expect(button).toHaveText("0Unread messages");
      await test
        .expect(button.locator(":scope > span").first())
        .toHaveText("0");
      await test
        .expect(button.locator(":scope > span").last())
        .toHaveAttribute("data-disclosure-indicator");
      await button.click();
      await test.expect(fixture.text("No unread messages")).toBeVisible();
    });

    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974019389
    test("preserves a zero description and omits a false description", async ({
      q,
    }) => {
      const fixture = query(q.article("Disclosure optional content"));
      const button = fixture.button("Pending requests");
      await test.expect(button).toHaveAccessibleDescription("0");
      await test.expect(button).toHaveText("Pending requests0");
      await button.click();
      await test.expect(fixture.text("No requests need review")).toBeVisible();
      const archived = fixture.button("Archived requests");
      await test.expect(archived).not.toHaveAttribute("aria-describedby");
      await test.expect(archived).not.toHaveAttribute("aria-labelledby");
    });

    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224162
    test("omits optional headings without hiding the filters", async ({
      page,
      q,
    }) => {
      const article = q.article("Disclosure optional content");
      const fixture = query(article);
      const assignee = fixture.combobox("Assignee");
      // The combobox popover renders in a portal, outside the fixture. The
      // combobox remounts when the headings toggle, so its popover is looked up
      // again each time.
      const getPopover = async () => {
        const id = await assignee.getAttribute("aria-controls");
        return query(page.locator(`[id="${id}"]`));
      };
      await test.expect(assignee).toBeVisible();
      await test.expect(fixture.combobox("Status")).toBeVisible();
      await test.expect(fixture.button("")).toHaveCount(0);
      await test
        .expect(article.locator("label").filter({ hasText: /^$/ }))
        .toHaveCount(0);
      await assignee.click();
      const popover = await getPopover();
      await test.expect(popover.option("Alice")).toBeVisible();
      await test.expect(popover.group()).not.toHaveAttribute("aria-labelledby");
      await assignee.press("Escape");
      await fixture.checkbox("Show filter headings").check();
      await test.expect(fixture.button("Project filters")).toBeVisible();
      await test.expect(assignee).not.toBeVisible();
      await fixture.button("Project filters").click();
      await test.expect(assignee).toBeVisible();
      await assignee.click();
      await test.expect((await getPopover()).group("Team")).toBeVisible();
      await assignee.press("Escape");
      await fixture.button("0").click();
      await test.expect(fixture.text("No pending requests")).toBeVisible();
    });

    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224487
    test("names a disclosure from its description without a missing label", async ({
      q,
    }) => {
      const fixture = query(q.article("Disclosure optional content"));
      const button = fixture.button("Advanced options");
      await test.expect(button).not.toHaveAttribute("aria-labelledby");
      // The description names the button, so describing it with the same text
      // would announce it twice.
      await test.expect(button).toHaveAccessibleName("Advanced options");
      await test.expect(button).not.toHaveAttribute("aria-describedby");
      await button.click();
      await test.expect(fixture.text("Advanced controls")).toBeVisible();
    });

    // Only a missing label may drop the description relationship. A caller's
    // aria-label names the button, so the description must still describe it.
    test("describes a description-only button that an aria-label names", async ({
      q,
    }) => {
      const fixture = query(q.article("Named description-only button"));
      const button = fixture.button("Advanced filters");
      await test.expect(button).toHaveAccessibleName("Advanced filters");
      await test.expect(button).toHaveAccessibleDescription("Tune the results");
    });
  });
});
