export default function Example() {
  return (
    <p
      ref={(element) => {
        element?.setAttribute("data-preview-commit", "");
      }}
    >
      Preview content
    </p>
  );
}
