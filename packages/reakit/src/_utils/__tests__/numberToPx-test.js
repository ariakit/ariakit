import numberToPx from "../numberToPx";

test("numberToPx", () => {
  expect(numberToPx(8)).toBe("8px");
  expect(numberToPx()).toBe("0px");
  expect(numberToPx("")).toBe("0px");
  expect(numberToPx("8px")).toBe("8px");
});
