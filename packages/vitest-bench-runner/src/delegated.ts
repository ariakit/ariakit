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
    super((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      if (executor) {
        executor(resolve, reject);
      }
    });

    if (this.resolve === undefined || this.reject === undefined) {
      throw new Error(`Expected resolve and reject to be assigned`);
    }
  }
}
