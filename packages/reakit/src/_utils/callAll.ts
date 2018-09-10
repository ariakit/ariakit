type Function = (...args: any[]) => void;

const callAll = (...fns: (Function | undefined)[]) => (...args: any[]) =>
  fns.forEach(fn => fn && fn(...args));

export default callAll;
