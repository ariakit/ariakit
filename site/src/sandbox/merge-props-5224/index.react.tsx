import { mergeProps } from "@ariakit/react-core/utils/misc";

export default function Example() {
  const handleClick = () => console.log("base click");

  // Test className with null override
  const result1 = mergeProps(
    { className: "base-class" },
    { className: null as unknown as string },
  );

  // Test className with undefined override
  const result2 = mergeProps(
    { className: "base-class" },
    { className: undefined as unknown as string },
  );

  // Test className with empty string override
  const result3 = mergeProps({ className: "base-class" }, { className: "" });

  // Test event handler with null override
  const result4 = mergeProps(
    { onClick: handleClick },
    { onClick: null as unknown as React.MouseEventHandler<any> },
  );

  // Test event handler with undefined override
  const result5 = mergeProps(
    { onClick: handleClick },
    { onClick: undefined as unknown as React.MouseEventHandler<any> },
  );

  return (
    <div>
      <h1>mergeProps Test</h1>
      <div data-testid="result1">className null: {result1.className}</div>
      <div data-testid="result2">className undefined: {result2.className}</div>
      <div data-testid="result3">className empty: {result3.className}</div>
      <div data-testid="result4">
        onClick null exists: {result4.onClick ? "yes" : "no"}
      </div>
      <div data-testid="result5">
        onClick undefined exists: {result5.onClick ? "yes" : "no"}
      </div>
    </div>
  );
}
