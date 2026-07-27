import { click, focus, press, q } from "@ariakit/test";
import { describe, expect, test } from "vitest";

interface FixtureLabels {
  country: string;
  fruit: string;
  loadFruitOptions: string;
  loadRenderedFruitOptions: string;
  renderedFruit: string;
  virtualizedCountry: string;
}

const fixtures: Record<"Combobox" | "Select", FixtureLabels> = {
  Combobox: {
    country: "Country",
    fruit: "Fruit",
    loadFruitOptions: "Load fruit options",
    loadRenderedFruitOptions: "Load rendered fruit options",
    renderedFruit: "Rendered fruit",
    virtualizedCountry: "Virtualized country",
  },
  Select: {
    country: "Legacy Select country",
    fruit: "Legacy Select fruit",
    loadFruitOptions: "Load legacy select fruit options",
    loadRenderedFruitOptions: "Load legacy select rendered fruit options",
    renderedFruit: "Legacy Select rendered fruit",
    virtualizedCountry: "Legacy Select virtualized country",
  },
};

for (const [name, labels] of Object.entries(fixtures)) {
  describe(name, () => {
    // https://github.com/ariakit/ariakit/issues/2699
    test("matches custom item content and skips empty text while open", async () => {
      await click(q.combobox(labels.country));
      expect(q.option("Brazil")).toHaveAttribute("data-active-item");

      await press("c");

      expect(q.option("Citrus")).not.toHaveAttribute("data-active-item");
      expect(q.option("Canada")).toHaveAttribute("data-active-item");
    });

    // https://github.com/ariakit/ariakit/issues/2699
    test("matches custom item content while closed", async () => {
      const select = q.combobox.ensure(labels.country);
      await focus(select);
      await press("c", select);

      expect(select).toHaveTextContent("Canada");
      expect(q.listbox()).not.toBeInTheDocument();
    });

    // https://github.com/ariakit/ariakit/issues/2699
    test("updates custom item text", async () => {
      await click(q.button("Use country aliases"));
      await click(q.combobox(labels.country));

      await press("d");

      expect(q.option("Canada")).toHaveAttribute("data-active-item");
    });

    // https://github.com/ariakit/ariakit/issues/2699
    test("matches custom content on an offscreen item", async () => {
      await click(q.combobox(labels.virtualizedCountry));
      expect(q.option("Canada")).toHaveAttribute("data-offscreen");

      await press("c");

      expect(q.option("Canada")).toHaveAttribute("data-active-item");
    });

    // https://github.com/ariakit/ariakit/issues/6733
    test("typeahead updates the value for late unmounted items", async () => {
      await click(q.button(labels.loadFruitOptions));

      const select = q.combobox.ensure(labels.fruit);
      expect(select).toHaveFocus();
      expect(q.option("Apple")).not.toBeInTheDocument();
      expect(q.status(`${labels.fruit} active item`)).toHaveTextContent(
        "orange",
      );
      expect(select).toHaveTextContent("Orange");

      await press("a", select);

      expect(q.status(`${labels.fruit} active item`)).toHaveTextContent(
        "apple",
      );
      expect(select).toHaveTextContent("Apple");
    });

    // https://github.com/ariakit/ariakit/issues/6733
    test("typeahead updates the value for late renderer items", async () => {
      await click(q.button(labels.loadRenderedFruitOptions));

      const select = q.combobox.ensure(labels.renderedFruit);
      expect(select).toHaveFocus();
      expect(q.option("Apple")).not.toBeInTheDocument();
      expect(q.status(`${labels.renderedFruit} active item`)).toHaveTextContent(
        "orange",
      );
      expect(select).toHaveTextContent("Orange");

      await press("a", select);

      expect(q.status(`${labels.renderedFruit} active item`)).toHaveTextContent(
        "apple",
      );
      expect(select).toHaveTextContent("Apple");
    });
  });
}
