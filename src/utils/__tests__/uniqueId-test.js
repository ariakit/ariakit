import id from "../uniqueId";

test("multiple calls yield different numbers", () => {
  for (let index = 0; index < 50; index += 1)
    // eslint-disable-next-line no-self-compare
    expect(id() !== id()).toBeTruthy();
});
