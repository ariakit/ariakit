type IconProps = {
  value: string;
};

export default function Icon({ value }: IconProps) {
  return (
    <div className="icon">
      <div className="icon-row">
        <div className="icon-item" data-active={value === "Top Left"} />
        <div className="icon-item" data-active={value === "Top Center"} />
        <div className="icon-item" data-active={value === "Top Right"} />
      </div>
      <div className="icon-row">
        <div className="icon-item" data-active={value === "Center Left"} />
        <div className="icon-item" data-active={value === "Center"} />
        <div className="icon-item" data-active={value === "Center Right"} />
      </div>
      <div className="icon-row">
        <div className="icon-item" data-active={value === "Bottom Left"} />
        <div className="icon-item" data-active={value === "Bottom Center"} />
        <div className="icon-item" data-active={value === "Bottom Right"} />
      </div>
    </div>
  );
}
