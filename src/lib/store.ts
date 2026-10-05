import { useSyncExternalStore } from "react";

export interface Store<T> {
  get: () => T;
  set: (value: T) => void;
  subscribe: (listener: () => void) => () => void;
}

/** Minimal external store for cross-tree UI state that changes rarely. */
export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(next) {
      if (Object.is(next, value)) return;
      value = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useStore<T>(store: Store<T>, serverValue?: T): T {
  return useSyncExternalStore(
    store.subscribe,
    store.get,
    () => (serverValue === undefined ? store.get() : serverValue),
  );
}
