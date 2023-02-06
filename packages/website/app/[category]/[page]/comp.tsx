"use client";
import { use } from "react";
import deps from "website/pages.deps";

interface CompProps {
  imports: Array<keyof typeof deps>;
  value?: string;
}

const cache = new WeakMap<Array<keyof typeof deps>, Promise<any[]>>();

function importAll(imports: Array<keyof typeof deps>) {
  if (cache.has(imports)) return cache.get(imports)!;
  const promise = Promise.all(imports.map((dep) => deps[dep]()));
  cache.set(imports, promise);
  return promise;
}

export default function Comp({ imports, value }: CompProps) {
  const deps2 = use(importAll(imports));
  console.log(deps2.length);
  return <pre>{value}</pre>;
}
