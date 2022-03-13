export interface Loadable<T> {
  get(): T;
}

type SyncStatus<T> =
  | {
      type: 'pending';
      promise: Promise<T>;
    }
  | {
      type: 'fulfilled';
      value: T;
    }
  | {
      type: 'rejected';
      error: unknown;
    };
export class Sync<T> implements Loadable<T> {
  protected status: SyncStatus<T>;

  constructor(promise: Promise<T>) {
    this.status = { type: 'pending', promise };
    promise.then(
      value => {
        this.status = { type: 'fulfilled', value };
        return value;
      },
      error => {
        this.status = { type: 'rejected', error };
        throw error;
      }
    );
  }

  get(): T {
    switch (this.status.type) {
      case 'fulfilled':
        return this.status.value;
      case 'pending':
        throw this.status.promise;
      case 'rejected':
        throw this.status.error;
    }
  }
}
export const sync = <T>(promise: Promise<T>) => new Sync(promise);

const syncs = new Map<symbol, Loadable<unknown>>();
export const useLoad = <T>(key: symbol, loader: () => Promise<T>) => {
  if (!syncs.has(key)) syncs.set(key, sync(loader()));

  return syncs.get(key) as Loadable<T>;
};
