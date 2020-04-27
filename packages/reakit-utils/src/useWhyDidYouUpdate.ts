import * as React from "react";

const count = {
  total: 0,
  perName: {} as Record<string, number>,
};

/**
 * @see https://usehooks.com/useWhyDidYouUpdate/
 */
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previousProps = React.useRef<Record<string, any> | undefined>(
    undefined
  );
  React.useEffect(() => {
    if (previousProps.current) {
      const allProps = { ...previousProps.current, ...props };
      const changesObj: Record<string, { from?: any; to?: any }> = {};
      for (const key in allProps) {
        if (previousProps.current[key] !== props[key]) {
          changesObj[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      }
      if (!count.perName[name]) {
        count.perName[name] = 0;
      }
      // eslint-disable-next-line no-console
      console.log(
        `[update x ${++count.total}]`,
        `[${name} x ${++count.perName[name]}]`,
        changesObj
      );
    }
    previousProps.current = props;
  });
}
