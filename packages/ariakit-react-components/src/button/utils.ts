interface ButtonTypeProps {
  render?: unknown;
  type?: string;
}

export function withDefaultButtonType<P extends object>(props: P) {
  const { render, type } = props as ButtonTypeProps;
  if (render || type !== undefined) return props;
  return { ...props, type: "button" };
}
