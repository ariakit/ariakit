/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { expect, test } from "vitest";
import type { CardShape } from "./card-layout.ts";
import { arrangeCards, cardSizes } from "./card-layout.ts";

interface Card {
  id: string;
  shape: CardShape;
}

const getShape = (card: Card) => card.shape;

function createCards(shapes: CardShape[]) {
  return shapes.map((shape, index) => ({
    id: String.fromCharCode(65 + index),
    shape,
  }));
}

// Places the cards like CSS grid auto-placement with grid-auto-flow: dense,
// which puts each card in the first cell, row by row, where it fits.
function placeDense(cards: Card[], columns: number) {
  const grid: (Card | undefined)[][] = [];
  const startRows: number[] = [];
  const fits = (card: Card, row: number, column: number) => {
    const size = cardSizes[card.shape];
    if (column + size.columns > columns) return false;
    for (let y = row; y < row + size.rows; y++) {
      for (let x = column; x < column + size.columns; x++) {
        if (grid[y]?.[x]) return false;
      }
    }
    return true;
  };
  for (const card of cards) {
    const size = cardSizes[card.shape];
    let row = 0;
    let column = 0;
    while (!fits(card, row, column)) {
      column += 1;
      if (column < columns) continue;
      column = 0;
      row += 1;
    }
    for (let y = row; y < row + size.rows; y++) {
      const gridRow = (grid[y] ??= []);
      for (let x = column; x < column + size.columns; x++) {
        gridRow[x] = card;
      }
    }
    startRows.push(row);
  }
  return { grid, lastStartRow: Math.max(0, ...startRows) };
}

// Counts the empty cells above the row where the last card starts. The rows
// from there down are the ragged bottom edge of the grid.
function countGaps(cards: Card[], columns: number) {
  const { grid, lastStartRow } = placeDense(cards, columns);
  let gaps = 0;
  for (let row = 0; row < lastStartRow; row++) {
    for (let column = 0; column < columns; column++) {
      if (!grid[row]?.[column]) {
        gaps += 1;
      }
    }
  }
  return gaps;
}

function drawLayout(cards: Card[], columns: number) {
  const { grid } = placeDense(cards, columns);
  return grid
    .map((row) =>
      Array.from(
        { length: columns },
        (_, column) => row[column]?.id ?? ".",
      ).join(""),
    )
    .join("\n");
}

function arrangeAndDraw(cards: Card[], columns: number) {
  return drawLayout(arrangeCards(cards, { columns, getShape }), columns);
}

function bigFirst(cards: Card[]) {
  const order = { full: 0, tall: 1, wide: 2, cell: 3 };
  return cards.toSorted((a, b) => order[a.shape] - order[b.shape]);
}

// Returns a deterministic pseudo-random number generator.
function createRandom(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) % 2 ** 31;
    return seed / 2 ** 31;
  };
}

// The shapes of the recipe cards in title order: App Shell (A), Breadcrumb,
// Checkbox, Combobox Group (D), Copy Button, Navigation (F), Radio, Skeleton,
// Table of Contents (I), Tabs, Text Field (K), Tooltip, and Truncated Text.
const recipes = createCards([
  "full",
  "cell",
  "cell",
  "tall",
  "cell",
  "full",
  "cell",
  "cell",
  "wide",
  "cell",
  "wide",
  "cell",
  "cell",
]);

test("arrangeCards spreads big cards across two columns", () => {
  expect(arrangeAndDraw(recipes, 2)).toBe(
    ["AA", "AA", "BC", "DE", "DG", "II", "HJ", "FF", "FF", "LM", "KK"].join(
      "\n",
    ),
  );
});

test("arrangeCards spreads big cards across three columns", () => {
  expect(arrangeAndDraw(recipes, 3)).toBe(
    ["AAB", "AAC", "EGD", "HJD", "IIL", "MKK", "FF.", "FF."].join("\n"),
  );
});

test("arrangeCards spreads big cards across four columns", () => {
  expect(arrangeAndDraw(recipes, 4)).toBe(
    ["AABC", "AAEG", "HJDL", "IIDM", "FFKK", "FF.."].join("\n"),
  );
});

test("arrangeCards keeps the input order of cards with the same shape", () => {
  for (const columns of [2, 3, 4]) {
    const order = arrangeCards(recipes, { columns, getShape });
    for (const shape of ["full", "tall", "wide", "cell"] as const) {
      const ids = recipes.filter((card) => card.shape === shape);
      expect(order.filter((card) => card.shape === shape)).toEqual(ids);
    }
  }
});

test("arrangeCards puts big cards first when every order leaves a gap", () => {
  const cards = createCards(["cell", "wide", "wide", "wide"]);
  const order = arrangeCards(cards, { columns: 3, getShape });
  expect(order.map((card) => card.id)).toEqual(["B", "C", "D", "A"]);
});

test("arrangeCards finds a gap-free order that takes a long search", () => {
  // Without pruning, the search for these cards needs more than 50,000 steps to
  // find the only kind of gap-free order at three columns.
  const cards = createCards([
    ...Array.from({ length: 4 }, () => "full" as const),
    "tall",
    ...Array.from({ length: 6 }, () => "wide" as const),
    ...Array.from({ length: 10 }, () => "cell" as const),
  ]);
  const order = arrangeCards(cards, { columns: 3, getShape });
  expect(countGaps(order, 3)).toBe(0);
  expect(countGaps(bigFirst(cards), 3)).toBeGreaterThan(0);
});

test("arrangeCards never leaves more gaps than big cards first", () => {
  const random = createRandom(7);
  const shapes = ["full", "tall", "wide"] as const;
  for (let i = 0; i < 300; i++) {
    const length = 6 + Math.floor(random() * 30);
    const bigChance = 0.15 + random() * 0.35;
    const cards = createCards(
      Array.from({ length }, () => {
        if (random() >= bigChance) return "cell";
        return shapes[Math.floor(random() * shapes.length)] ?? "cell";
      }),
    );
    for (const columns of [2, 3, 4]) {
      const order = arrangeCards(cards, { columns, getShape });
      expect(order).toHaveLength(cards.length);
      expect(new Set(order)).toEqual(new Set(cards));
      const gaps = countGaps(order, columns);
      if (!gaps) continue;
      expect(gaps).toBe(countGaps(bigFirst(cards), columns));
    }
  }
});
