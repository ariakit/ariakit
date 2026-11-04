/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

export type CardShape = "full" | "tall" | "wide" | "cell";

interface CardSize {
  columns: number;
  rows: number;
}

interface Placement {
  shape: CardShape;
  row: number;
  column: number;
}

interface PlacedBigCard {
  row: number;
  rows: number;
  left: boolean;
}

export interface ArrangeCardsOptions<T> {
  /**
   * The number of columns in the grid. It must be at least 2, since a grid with
   * one column doesn't span cards across columns.
   */
  columns: number;
  /**
   * Returns the shape of a card.
   */
  getShape: (card: T) => CardShape;
}

/**
 * The grid tracks that each card shape spans.
 */
export const cardSizes = {
  full: { columns: 2, rows: 2 },
  tall: { columns: 1, rows: 2 },
  wide: { columns: 2, rows: 1 },
  cell: { columns: 1, rows: 1 },
} satisfies Record<CardShape, CardSize>;

const bigShapes = ["full", "tall", "wide"] satisfies CardShape[];

const bigFirstOrder = {
  full: 0,
  tall: 1,
  wide: 2,
  cell: 3,
} satisfies Record<CardShape, number>;

// Search steps after which the search gives up on a gap-free arrangement.
// Collections with mostly small cards finish far below it. Large collections
// with mostly big cards can reach it, and then get the big-first order.
const SEARCH_BUDGET = 20_000;

/**
 * Returns the cards in the order that a grid with `grid-auto-flow: dense` and
 * `columns` columns should receive them. Big cards spread across the grid, and
 * no empty cell stays above the row where the last card starts. Cards of the
 * same shape keep their input order.
 *
 * When no such arrangement exists, or the search gives up, big cards come
 * first, so dense placement can fill the holes that they leave with smaller
 * cards.
 */
export function arrangeCards<T>(
  cards: T[],
  { columns, getShape }: ArrangeCardsOptions<T>,
): T[] {
  const queues: Record<CardShape, T[]> = {
    full: [],
    tall: [],
    wide: [],
    cell: [],
  };
  for (const card of cards) {
    queues[getShape(card)].push(card);
  }
  const placed = { full: 0, tall: 0, wide: 0, cell: 0 };
  const bigCount = cards.length - queues.cell.length;
  // The number of cells to put between two big cards.
  const spacing = bigCount ? queues.cell.length / bigCount : Infinity;
  const grid: boolean[][] = [];
  const order: T[] = [];
  const bigCards: PlacedBigCard[] = [];
  let steps = 0;
  // States from which no gap-free arrangement exists. The preferences only
  // change the order in which the search tries shapes, so they are not part of
  // the state.
  const failedStates = new Set<string>();
  // An empty cell is fine only in the bottom band, so no card can start in a
  // row below it.
  let holeRow = Infinity;

  const hasRemaining = (shape: CardShape) =>
    placed[shape] < queues[shape].length;

  const isFree = (row: number, column: number) =>
    column < columns && !grid[row]?.[column];

  const getRowKey = (row: number) =>
    Array.from({ length: columns }, (_, column) =>
      isFree(row, column) ? 0 : 1,
    ).join("");

  const fits = ({ shape, row, column }: Placement) => {
    const size = cardSizes[shape];
    for (let y = row; y < row + size.rows; y++) {
      for (let x = column; x < column + size.columns; x++) {
        if (!isFree(y, x)) return false;
      }
    }
    return true;
  };

  const fill = ({ shape, row, column }: Placement, value: boolean) => {
    const size = cardSizes[shape];
    for (let y = row; y < row + size.rows; y++) {
      const gridRow = (grid[y] ??= []);
      for (let x = column; x < column + size.columns; x++) {
        gridRow[x] = value;
      }
    }
  };

  const isBigCardDue = (row: number, column: number, cellsSinceBig: number) => {
    if (cellsSinceBig < spacing) return false;
    // Prefer a big card that shares no row with another big card.
    const sharesRow = bigCards.some(
      (card) => row < card.row + card.rows && card.row < row + 2,
    );
    if (sharesRow) return false;
    // Prefer to alternate big cards between the left and right halves of the
    // grid. In two columns, a card that spans both columns has no side.
    const lastBigCard = bigCards.at(-1);
    const left = column < columns / 2;
    if (columns > 2 && lastBigCard?.left === left) return false;
    return true;
  };

  const getShapes = (
    row: number,
    column: number,
    cellsSinceBig: number,
  ): CardShape[] => {
    // The big shape with the smallest share placed so far goes first. The sort
    // is stable, so ties keep the order of bigShapes.
    const shapes: CardShape[] = bigShapes
      .filter((shape) => hasRemaining(shape) && fits({ shape, row, column }))
      .sort(
        (a, b) => placed[a] / queues[a].length - placed[b] / queues[b].length,
      );
    if (!hasRemaining("cell")) return shapes;
    if (isBigCardDue(row, column, cellsSinceBig)) {
      return [...shapes, "cell"];
    }
    return ["cell", ...shapes];
  };

  // Places a card in the first empty cell again and again. Dense placement puts
  // each card in the first cell where it fits, which is that same cell, so the
  // browser places every card where this search decides.
  const search = (row: number, column: number, cellsSinceBig: number) => {
    if (order.length === cards.length) return true;
    steps += 1;
    if (steps > SEARCH_BUDGET) return false;
    while (!isFree(row, column)) {
      column += 1;
      if (column < columns) continue;
      column = 0;
      row += 1;
    }
    if (row > holeRow) return false;
    // Every cell above the current row is taken, and no card reaches below the
    // next row, so these values decide what the cards that are left can do.
    const state = [
      placed.full,
      placed.tall,
      placed.wide,
      placed.cell,
      column,
      holeRow === row,
      getRowKey(row),
      getRowKey(row + 1),
    ].join("|");
    if (failedStates.has(state)) return false;
    if (place(row, column, cellsSinceBig)) return true;
    failedStates.add(state);
    return false;
  };

  const place = (row: number, column: number, cellsSinceBig: number) => {
    const shapes = getShapes(row, column, cellsSinceBig);
    for (const shape of shapes) {
      const card = queues[shape][placed[shape]];
      if (card === undefined) continue;
      const isBig = shape !== "cell";
      const placement = { shape, row, column };
      fill(placement, true);
      order.push(card);
      placed[shape] += 1;
      if (isBig) {
        const { rows } = cardSizes[shape];
        bigCards.push({ row, rows, left: column < columns / 2 });
      }
      if (search(row, column, isBig ? 0 : cellsSinceBig + 1)) return true;
      if (isBig) {
        bigCards.pop();
      }
      placed[shape] -= 1;
      order.pop();
      fill(placement, false);
    }
    if (shapes.length) return false;
    // No card that is left fits in this cell, so it stays empty.
    const hole = { shape: "cell" as const, row, column };
    const previousHoleRow = holeRow;
    holeRow = Math.min(holeRow, row);
    fill(hole, true);
    if (search(row, column, cellsSinceBig)) return true;
    fill(hole, false);
    holeRow = previousHoleRow;
    return false;
  };

  // The first card is a big card.
  if (search(0, 0, spacing)) return order;
  return cards.toSorted(
    (a, b) => bigFirstOrder[getShape(a)] - bigFirstOrder[getShape(b)],
  );
}
