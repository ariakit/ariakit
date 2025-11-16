/**
 * @summary
 * A promise that can be stopped outside of the instance.
 */
export class Delegated<T = void> extends Promise<T> {
  resolve!: (value: T | PromiseLike<T>) => void;
  reject!: (reason?: any) => void;

  constructor(
    executor?: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void,
    ) => void,
  ) {
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;

    super((res, rej) => {
      resolve = res;
      reject = rej;

      if (executor) {
        executor(res, rej);
      }
    });

    this.resolve = resolve!;
    this.reject = reject!;

    if (!this.resolve || !this.reject) {
      throw new Error("Expected resolve and reject to be defined");
    }
  }

  static from<T>(promise: PromiseLike<T>): Delegated<T> {
    return new Delegated((res, rej) => {
      try {
        promise.then(res);
      } catch (reason) {
        rej(reason);
      }
    });
  }
}
