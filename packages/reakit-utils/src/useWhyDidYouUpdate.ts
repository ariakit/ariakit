// https://github.com/devhubapp/devhub/blob/13b5f96bc485d71a9febcfc6f7016a485b8864c7/packages/components/src/hooks/use-why-did-you-update.ts
import * as React from "react";

export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const latestProps = React.useRef(props);

  React.useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    const allKeys = Object.keys({ ...latestProps.current, ...props });

    const changesObj: Record<string, { from: any; to: any }> = {};
    allKeys.forEach(key => {
      if (latestProps.current[key] !== props[key]) {
        changesObj[key] = { from: latestProps.current[key], to: props[key] };
      }
    });

    if (Object.keys(changesObj).length) {
      // eslint-disable-next-line no-console
      console.log("[why-did-you-update]", name, changesObj);
    }

    latestProps.current = props;
  }, Object.values(props));
}
