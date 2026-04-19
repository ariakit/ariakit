export function defer<T>() {
  const deferred = {
    resolve: (_value: T | PromiseLike<T>) => {},
    reject: (_reason?: any) => {},
  };

  const promise = new Promise<T>((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return Object.assign(promise, deferred);
}
