import * as React from "react";
import { render, wait } from "@testing-library/react";
import { unstable_IdProps } from "../Id";
import { unstable_IdGroupProps } from "../IdGroup";
import {
  unstable_IdProvider as IdProvider,
  unstable_useIdState as useIdState,
  unstable_useId as useId,
  unstable_Id as Id,
  unstable_IdGroup as IdGroup
} from "..";

// TODO: Replace getByText by getByLabelText
// Test useId
// Test useId passing id to options and htmlProps
// Test passing id directly to IdGroup with useIdState (should update baseId)

// Basically puts the id prop into the aria-label prop
function TestId(props: unstable_IdProps) {
  return (
    <Id {...props}>
      {htmlProps => (
        <div {...htmlProps} aria-label={htmlProps.id}>
          {props.children}
        </div>
      )}
    </Id>
  );
}

// Basically puts the id prop into the aria-label prop
function TestIdGroup(props: unstable_IdGroupProps) {
  return (
    <IdGroup {...props}>
      {htmlProps => (
        <div {...htmlProps} aria-label={htmlProps.id}>
          {props.children}
        </div>
      )}
    </IdGroup>
  );
}

test("Id", () => {
  const Test = () => {
    return (
      <>
        <TestId />
        <TestId />
      </>
    );
  };
  const { getAllByLabelText, rerender } = render(<Test />);
  const ids = getAllByLabelText(/id-[a-z\d]{2,}$/).map(el => el.id);
  expect(ids).toHaveLength(2);
  // shouldn't change ids
  rerender(<Test />);
  const nextIds = getAllByLabelText(/id-[a-z\d]{2,}$/).map(el => el.id);
  expect(ids).toEqual(nextIds);
});

test("Id with baseId", () => {
  const Test = () => {
    return (
      <>
        <TestId baseId="a" />
        <TestId baseId="a" />
      </>
    );
  };
  const { getAllByLabelText, rerender } = render(<Test />);
  const ids = getAllByLabelText(/a-[a-z\d]{2,}$/).map(el => el.id);
  expect(ids).toHaveLength(2);
  // shouldn't change ids
  rerender(<Test />);
  const nextIds = getAllByLabelText(/a-[a-z\d]{2,}$/).map(el => el.id);
  expect(ids).toEqual(nextIds);
});

test("Id within IdGroup", () => {
  const Test = () => {
    return (
      <TestIdGroup>
        <TestId />
        <TestId />
      </TestIdGroup>
    );
  };
  const { getAllByLabelText, rerender } = render(<Test />);
  const ids = getAllByLabelText(/id-[a-z\d]{2,}$/).map(el => el.id);
  expect(ids).toHaveLength(3);
  // shouldn't change ids
  rerender(<Test />);
  const nextIds = getAllByLabelText(/id-[a-z\d]{2,}$/).map(el => el.id);
  expect(ids).toEqual(nextIds);
});

test("Id within IdProvider", () => {
  const Test = () => {
    return (
      <IdProvider>
        <Id />
        <Id />
      </IdProvider>
    );
  };
  const { container } = render(<Test />);
  // IDs will be sequential because it's handled by the Provider
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        id="id-1"
      />
      <div
        id="id-2"
      />
    </div>
  `);
});

test("Id with baseId within IdProvider", () => {
  const Test = () => {
    return (
      <IdProvider>
        <Id baseId="a" />
        <Id baseId="a" />
      </IdProvider>
    );
  };
  const { container } = render(<Test />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        id="a-1"
      />
      <div
        id="a-2"
      />
    </div>
  `);
});

test("Id within IdGroup within IdProvider", () => {
  const Test = () => {
    return (
      <IdProvider>
        <IdGroup>
          <Id />
          <Id />
        </IdGroup>
      </IdProvider>
    );
  };
  const { container } = render(<Test />);
  // IDs will be sequential because it's handled by the Provider
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        id="id-1"
      >
        <div
          id="id-2"
        />
        <div
          id="id-3"
        />
      </div>
    </div>
  `);
});

test("Id within IdProvider with prefix", () => {
  const Test = () => {
    return (
      <IdProvider prefix="a">
        <Id />
        <Id />
      </IdProvider>
    );
  };
  const { container } = render(<Test />);
  // IDs will be sequential because it's handled by the Provider
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        id="a-1"
      />
      <div
        id="a-2"
      />
    </div>
  `);
});

test("Id within IdGroup within IdProvider with prefix", () => {
  const Test = () => {
    return (
      <IdProvider prefix="a">
        <IdGroup>
          <Id />
          <Id />
        </IdGroup>
      </IdProvider>
    );
  };
  const { container } = render(<Test />);
  // IDs will be sequential because it's handled by the Provider
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        id="a-1"
      >
        <div
          id="a-2"
        />
        <div
          id="a-3"
        />
      </div>
    </div>
  `);
});

test("Id with useIdState", () => {
  const Test = () => {
    const id = useIdState();
    return (
      <>
        <TestId {...id} />
        <TestId {...id} />
      </>
    );
  };
  const { getByLabelText, rerender } = render(<Test />);
  const { id: id1 } = getByLabelText(/id-[a-z\d]{2,}-1$/);
  const { id: id2 } = getByLabelText(/id-[a-z\d]{2,}-2$/);
  // shouldn't change ids
  rerender(<Test />);
  const { id: nextId1 } = getByLabelText(/id-[a-z\d]{2,}-1$/);
  const { id: nextId2 } = getByLabelText(/id-[a-z\d]{2,}-2$/);
  expect(id1).toBe(nextId1);
  expect(id2).toBe(nextId2);
});

test("Id within IdGroup with useIdState", () => {
  const Test = () => {
    const id = useIdState();
    return (
      <TestIdGroup {...id}>
        <TestId {...id} />
        <TestId {...id} />
      </TestIdGroup>
    );
  };
  const { getByLabelText, rerender } = render(<Test />);
  const { id: groupId } = getByLabelText(/id-[a-z\d]{2,}$/);
  const { id: id1 } = getByLabelText(new RegExp(`${groupId}-1$`));
  const { id: id2 } = getByLabelText(new RegExp(`${groupId}-2$`));
  // shouldn't change ids
  rerender(<Test />);
  const { id: nextId1 } = getByLabelText(new RegExp(`${groupId}-1$`));
  const { id: nextId2 } = getByLabelText(new RegExp(`${groupId}-2$`));
  expect(id1).toBe(nextId1);
  expect(id2).toBe(nextId2);
});

test("Id within IdGroup with id with useIdState", async () => {
  const Test = () => {
    const id = useIdState();
    return (
      <IdGroup {...id} id="a">
        <Id {...id} />
        <Id {...id} />
      </IdGroup>
    );
  };
  const { container } = render(<Test />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        id="a"
      >
        <div
          id="a-1"
        />
        <div
          id="a-2"
        />
      </div>
    </div>
  `);
});

test("Id with useIdState within IdProvider", () => {
  const Test = () => {
    const id = useIdState();
    return (
      <>
        <Id {...id} />
        <Id {...id} />
      </>
    );
  };
  const { container } = render(
    <IdProvider>
      <Test />
    </IdProvider>
  );
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        id="id-1-1"
      />
      <div
        id="id-1-2"
      />
    </div>
  `);
});

test("Id with useIdState within IdProvider with prefix", () => {
  const Test = () => {
    const id = useIdState();
    return (
      <>
        <Id {...id} />
        <Id {...id} />
      </>
    );
  };
  const { container } = render(
    <IdProvider prefix="a">
      <Test />
    </IdProvider>
  );
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        id="a-1-1"
      />
      <div
        id="a-1-2"
      />
    </div>
  `);
});

test("Id with useIdState with baseId", () => {
  const Test = () => {
    const id = useIdState({ baseId: "a" });
    return (
      <>
        <Id {...id} />
        <Id {...id} />
      </>
    );
  };
  const { container } = render(<Test />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        id="a-1"
      />
      <div
        id="a-2"
      />
    </div>
  `);
});

test("Id with useIdState with baseId within IdProvider", () => {
  const Test = () => {
    const id = useIdState({ baseId: "a" });
    return (
      <>
        <Id {...id} />
        <Id {...id} />
      </>
    );
  };
  const { container } = render(
    <IdProvider>
      <Test />
    </IdProvider>
  );
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        id="a-1"
      />
      <div
        id="a-2"
      />
    </div>
  `);
});

test("Id with useIdState with baseId within IdProvider with prefix", () => {
  const Test = () => {
    const id = useIdState({ baseId: "b" });
    return (
      <>
        <Id {...id} />
        <Id {...id} />
      </>
    );
  };
  const { container } = render(
    <IdProvider prefix="a">
      <Test />
    </IdProvider>
  );
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        id="b-1"
      />
      <div
        id="b-2"
      />
    </div>
  `);
});

test("Id within IdProvider with useIdState with baseId", () => {
  const Test = () => {
    const id = useIdState({ baseId: "b" });
    return (
      <IdProvider>
        <Id {...id} />
        <Id {...id} />
      </IdProvider>
    );
  };
  const { container } = render(<Test />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        id="b-1"
      />
      <div
        id="b-2"
      />
    </div>
  `);
});

test("Id within IdProvider with prefix with useIdState with baseId", () => {
  const Test = () => {
    const id = useIdState({ baseId: "b" });
    return (
      <IdProvider prefix="a">
        <Id {...id} />
        <Id {...id} />
      </IdProvider>
    );
  };
  const { container } = render(<Test />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        id="b-1"
      />
      <div
        id="b-2"
      />
    </div>
  `);
});
