import { ByRoleOptions } from "@testing-library/dom";
import {
  act,
  click,
  getByRole,
  press,
  queryByRole,
  render,
} from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

const getTree = () => getByRole("tree");
const getTreeItem = (name: ByRoleOptions["name"]) =>
  getByRole("treeitem", { name, hidden: true });
const queryTreeItem = (name: ByRoleOptions["name"]) =>
  queryByRole("treeitem", { name });

test("a11y", async () => {
  const { container } = render(<Example />);
  await act(async () => {
    expect(await axe(container)).toHaveNoViolations();
  });
});

test("tree is showing correct items when default is set", async () => {
  render(<Example />);
  expect(getTreeItem("Item 1")).toBeVisible();
  expect(getTreeItem("Item 2")).toBeVisible();
  expect(getTreeItem("Item 2.1")).toBeVisible();
  expect(getTreeItem("Item 2.2")).toBeVisible();
  expect(getTreeItem("Item 2.3")).toBeVisible();
  expect(getTreeItem("Item 2.4")).toBeVisible();
  expect(getTreeItem("Item 3")).toBeVisible();
  expect(getTreeItem("Item 4")).toBeVisible();
});

test("collapse on click expanded treeitem", async () => {
  render(<Example />);
  expect(getTree()).toBeVisible();
  expect(getTreeItem("Item 2.1")).toBeVisible();
  await click(getTreeItem("Item 2"));
  expect(queryTreeItem("Item 2.1")).not.toBeInTheDocument();
});

test("expand on click collapsed treeitem", async () => {
  render(<Example />);
  expect(queryTreeItem("Item 2.4.1")).not.toBeInTheDocument();
  await click(getTreeItem("Item 2.4"));
  expect(getTreeItem("Item 2.4.1")).toBeVisible();
});

test("collapse/expand on spacebar", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  expect(getTreeItem("Item 2.1")).toBeVisible();
  await press.Space();
  expect(queryTreeItem("Item 2.1")).not.toBeInTheDocument();
  await press.Space();
  expect(getTreeItem("Item 2.1")).toBeVisible();
});

test("collapse/expand on enter", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  expect(getTreeItem("Item 2.1")).toBeVisible();
  await press.Enter();
  expect(queryTreeItem("Item 2.1")).not.toBeInTheDocument();
  await press.Enter();
  expect(getTreeItem("Item 2.1")).toBeVisible();
});

test("collapse/expand on arrow left/right", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  expect(getTreeItem("Item 2")).toHaveFocus();
  expect(getTreeItem("Item 2.1")).toBeVisible();
  await press.ArrowLeft();
  expect(queryTreeItem("Item 2.1")).not.toBeInTheDocument();
  await press.ArrowRight();
  expect(getTreeItem("Item 2.1")).toBeVisible();
  expect(getTreeItem("Item 2")).toHaveFocus();
});

test("when node is expanded, focus on next node on arrow right", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  expect(getTreeItem("Item 2")).toHaveFocus();
  await press.ArrowRight();
  expect(getTreeItem("Item 2.1")).toHaveFocus();
});

test("when child node is focused, focus on parent node on arrow left without collapsing", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(getTreeItem("Item 2.1")).toHaveFocus();
  await press.ArrowLeft();
  expect(getTreeItem("Item 2")).toHaveFocus();
  expect(getTreeItem("Item 2.1")).toBeVisible();
});

test("when a node is expanded, collapsing its parent node should hide the node too", async () => {
  render(<Example />);
  expect(queryTreeItem("Item 2.4.1")).not.toBeInTheDocument();
  await click(getTreeItem("Item 2.4"));
  expect(getTreeItem("Item 2.4.1")).toBeVisible();
  await click(getTreeItem("Item 2"));
  expect(queryTreeItem("Item 2.4.1")).not.toBeInTheDocument();
});

test("go to last item by pressing End", async () => {
  render(<Example />);
  await press.Tab();
  expect(getTreeItem("Item 1")).toHaveFocus();
  await press.End();
  expect(getTreeItem("Item 4")).toHaveFocus();
});

test("go to first item by pressing Home", async () => {
  render(<Example />);
  await press.Tab();
  expect(getTreeItem("Item 1")).toHaveFocus();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(getTreeItem("Item 2.1")).toHaveFocus();
  await press.Home();
  expect(getTreeItem("Item 1")).toHaveFocus();
});

test("navigating using keyboard skips hidden tree items (when a tree item is expanded)", async () => {
  render(<Example />);
  await press.Tab();
  expect(getTreeItem("Item 1")).toHaveFocus();
  await press.ArrowDown();
  expect(getTreeItem("Item 2")).toHaveFocus();
  await press.ArrowDown();
  expect(getTreeItem("Item 2.1")).toHaveFocus();
  await press.ArrowDown();
  expect(getTreeItem("Item 2.2")).toHaveFocus();
  await press.ArrowDown();
  expect(getTreeItem("Item 2.3")).toHaveFocus();
  await press.ArrowDown();
  expect(getTreeItem("Item 2.4")).toHaveFocus();
  await press.ArrowDown();
  expect(getTreeItem("Item 3")).toHaveFocus();
  await press.ArrowDown();
  expect(getTreeItem("Item 4")).toHaveFocus();
});

test("navigating using keyboard skips hidden tree items (when all are collapsed)", async () => {
  render(<Example />);
  await click(getTreeItem("Item 2.4"));
  expect(getTreeItem("Item 2.4.1")).toBeVisible();
  await click(getTreeItem("Item 2"));
  expect(queryTreeItem("Item 2.1")).not.toBeInTheDocument();
  await press.Home();
  expect(getTreeItem("Item 1")).toHaveFocus();
  await press.ArrowDown();
  expect(getTreeItem("Item 2")).toHaveFocus();
  await press.ArrowDown();
  expect(getTreeItem("Item 3")).toHaveFocus();
  await press.ArrowDown();
  expect(getTreeItem("Item 4")).toHaveFocus();
});
