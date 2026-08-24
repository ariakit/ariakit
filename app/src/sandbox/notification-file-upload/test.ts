import { click, q, type as typeText } from "@ariakit/test";
import { expect, test } from "vitest";

test("updates one upload notification through completion", async () => {
  expect(q.alertdialog("Transfers restored")).toBeVisible();

  await click(q.button("Start upload"));
  const uploading = q.alertdialog("Uploading design-assets.zip");
  expect(uploading).toHaveTextContent("0 of 12 files uploaded.");

  await click(q.button("Advance upload"));
  await click(q.button("Advance upload"));
  expect(uploading).toHaveTextContent("6 of 12 files uploaded.");

  await click(q.button("Advance upload"));
  await click(q.button("Advance upload"));
  expect(q.alertdialog("Upload complete")).toHaveTextContent(
    "12 files uploaded successfully.",
  );
});

// https://github.com/ariakit/ariakit/issues/7235
test("announces search results without adding a card", async () => {
  expect(q.alertdialog.all()).toHaveLength(1);

  const getSearchAnnouncements = () =>
    q.log.all
      .hidden()
      .map((log) => log.textContent)
      .filter((text) => text?.includes("found."));

  await typeText("archive", q.textbox("Search files"));

  expect(q.alertdialog.all()).toHaveLength(1);
  expect(q.text("1 item")).toBeVisible();
  expect(getSearchAnnouncements()).toEqual([]);
  await expect.poll(getSearchAnnouncements).toEqual(["1 file found."]);
});

test("shows the latest three burst records and filters for attention", async () => {
  await click(q.button("Queue 10 files"));

  expect(q.alertdialog.all()).toHaveLength(3);
  expect(q.alertdialog("File 8 queued")).toBeVisible();
  expect(q.alertdialog("File 10 queued")).toBeVisible();

  await click(q.button("Test storage warning"));
  await click(q.button("Attention"));

  expect(q.alertdialog.all()).toHaveLength(1);
  expect(q.alertdialog("Storage is full")).toBeVisible();
});
