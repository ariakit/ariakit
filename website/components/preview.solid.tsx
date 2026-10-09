import { Suspense } from "solid-js/web";
import examples from "@/build-pages/examples.ts";

interface Props {
  path: string;
  id?: string;
  css?: string;
}

export function SolidPreviewContent(props: Props) {
  const Component = examples[props.path];
  if (!Component) throw new Error(`Component not found: ${props.path}`);
  return (
    <>
      {/* @ts-ignore */}
      <Suspense fallback={<div>Loading...</div>}>
        {/* @ts-ignore */}
        <Component />
      </Suspense>
      {/* @ts-ignore */}
      {props.css && <style innerHTML={props.css} />}
    </>
  );
}
