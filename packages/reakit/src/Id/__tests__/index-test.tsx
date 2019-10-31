import * as React from "react";
import { render } from "@testing-library/react";
import {
  unstable_IdProvider as IdProvider,
  unstable_useIdState as useIdState,
  unstable_useId as useId,
  unstable_Id as Id,
  unstable_IdGroup as IdGroup
} from "..";

// TODO: Replace getByText by getByLabelText
// Abstract Id/IdGroup
// Test useId
// Test useId passing id to options and htmlProps
// Test Provider with Id (maybe useId) with baseId passed directly to the component/hook (without useIdState)
// Test passing id directly to IdGroup with useIdState (should update baseId)

test("render without useState", () => {
  const Test = () => {
    return (
      <>
        <Id>{props => <div>{props.id}</div>}</Id>
        <Id>{props => <div>{props.id}</div>}</Id>
      </>
    );
  };
  const { getAllByText } = render(<Test />);
  expect(getAllByText(/id-[a-z\d]{2,}$/)).toHaveLength(2);
});

test("render without useState with IdGroup", () => {
  const Test = () => {
    return (
      <IdGroup>
        {groupProps => (
          <>
            <div>{groupProps.id}</div>
            <Id>{props => <div>{props.id}</div>}</Id>
            <Id>{props => <div>{props.id}</div>}</Id>
          </>
        )}
      </IdGroup>
    );
  };
  const { getAllByText } = render(<Test />);
  expect(getAllByText(/id-[a-z\d]{2,}$/)).toHaveLength(3);
});

test("render without useState with Provider", () => {
  const Test = () => {
    return (
      <IdProvider>
        <Id>{props => <div>{props.id}</div>}</Id>
        <Id>{props => <div>{props.id}</div>}</Id>
      </IdProvider>
    );
  };
  const { getByText } = render(<Test />);
  getByText("id-1");
  getByText("id-2");
});

test("render without useState with Provider with IdGroup", () => {
  const Test = () => {
    return (
      <IdProvider>
        <IdGroup>
          {groupProps => (
            <>
              <div>{groupProps.id}</div>
              <Id>{props => <div>{props.id}</div>}</Id>
              <Id>{props => <div>{props.id}</div>}</Id>
            </>
          )}
        </IdGroup>
      </IdProvider>
    );
  };
  const { getByText } = render(<Test />);
  getByText("id-1");
  getByText("id-2");
  getByText("id-3");
});

test("render without useState with Provider with prefix", () => {
  const Test = () => {
    return (
      <IdProvider prefix="a">
        <Id>{props => <div>{props.id}</div>}</Id>
        <Id>{props => <div>{props.id}</div>}</Id>
      </IdProvider>
    );
  };
  const { getByText } = render(<Test />);
  getByText("a-1");
  getByText("a-2");
});

test("render without useState with Provider with prefix with IdGroup", () => {
  const Test = () => {
    return (
      <IdProvider prefix="a">
        <IdGroup>
          {groupProps => (
            <>
              <div>{groupProps.id}</div>
              <Id>{props => <div>{props.id}</div>}</Id>
              <Id>{props => <div>{props.id}</div>}</Id>
            </>
          )}
        </IdGroup>
      </IdProvider>
    );
  };
  const { getByText } = render(<Test />);
  getByText("a-1");
  getByText("a-2");
  getByText("a-3");
});

test("render with state", () => {
  const Test = () => {
    const id = useIdState();
    return (
      <>
        <Id {...id}>{props => <div>{props.id}</div>}</Id>
        <Id {...id}>{props => <div>{props.id}</div>}</Id>
      </>
    );
  };
  const { getByText } = render(<Test />);
  getByText(/id-[a-z\d]{2,}-1$/);
  getByText(/id-[a-z\d]{2,}-2$/);
});

test("render with state with IdGroup", () => {
  const Test = () => {
    const id = useIdState();
    return (
      <IdGroup {...id}>
        {groupProps => (
          <>
            <div>{groupProps.id}</div>
            <Id {...id}>{props => <div>{props.id}</div>}</Id>
            <Id {...id}>{props => <div>{props.id}</div>}</Id>
          </>
        )}
      </IdGroup>
    );
  };
  const { getByText } = render(<Test />);
  getByText(/id-[a-z\d]{2,}$/);
  getByText(/id-[a-z\d]{2,}-1$/);
  getByText(/id-[a-z\d]{2,}-2$/);
});

test("render with state with Provider", () => {
  const Test = () => {
    const id = useIdState();
    return (
      <>
        <Id {...id}>{props => <div>{props.id}</div>}</Id>
        <Id {...id}>{props => <div>{props.id}</div>}</Id>
      </>
    );
  };
  const { getByText } = render(
    <IdProvider>
      <Test />
    </IdProvider>
  );
  getByText("id-1-1");
  getByText("id-1-2");
});

test("render with state with Provider with prefux", () => {
  const Test = () => {
    const id = useIdState();
    return (
      <>
        <Id {...id}>{props => <div>{props.id}</div>}</Id>
        <Id {...id}>{props => <div>{props.id}</div>}</Id>
      </>
    );
  };
  const { getByText } = render(
    <IdProvider prefix="a">
      <Test />
    </IdProvider>
  );
  getByText("a-1-1");
  getByText("a-1-2");
});

test("render with state and baseId", () => {
  const Test = () => {
    const id = useIdState({ baseId: "a" });
    return (
      <>
        <Id {...id}>{props => <div>{props.id}</div>}</Id>
        <Id {...id}>{props => <div>{props.id}</div>}</Id>
      </>
    );
  };
  const { getByText } = render(<Test />);
  getByText("a-1");
  getByText("a-2");
});

test("render with state and baseId with Provider", () => {
  const Test = () => {
    const id = useIdState({ baseId: "a" });
    return (
      <>
        <Id {...id}>{props => <div>{props.id}</div>}</Id>
        <Id {...id}>{props => <div>{props.id}</div>}</Id>
      </>
    );
  };
  const { getByText } = render(
    <IdProvider>
      <Test />
    </IdProvider>
  );
  getByText("a-1");
  getByText("a-2");
});

test("render with state and baseId with Provider with prefix", () => {
  const Test = () => {
    const id = useIdState({ baseId: "b" });
    return (
      <>
        <Id {...id}>{props => <div>{props.id}</div>}</Id>
        <Id {...id}>{props => <div>{props.id}</div>}</Id>
      </>
    );
  };
  const { getByText } = render(
    <IdProvider prefix="a">
      <Test />
    </IdProvider>
  );
  getByText("b-1");
  getByText("b-2");
});
