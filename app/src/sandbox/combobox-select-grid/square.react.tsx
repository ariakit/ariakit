interface IconProps {
  value: string;
}

export default function Square({ value }: IconProps) {
  return (
    <div>
      <div>
        <div data-active={value === "Top Left"} />
        <div data-active={value === "Top Center"} />
        <div data-active={value === "Top Right"} />
      </div>
      <div>
        <div data-active={value === "Center Left"} />
        <div data-active={value === "Center"} />
        <div data-active={value === "Center Right"} />
      </div>
      <div>
        <div data-active={value === "Bottom Left"} />
        <div data-active={value === "Bottom Center"} />
        <div data-active={value === "Bottom Right"} />
      </div>
    </div>
  );
}
