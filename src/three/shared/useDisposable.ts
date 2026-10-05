"use client";

import { useEffect, useMemo, type DependencyList } from "react";

interface Disposable {
  dispose: () => void;
}

/**
 * Memoise a manually created Three.js resource (geometry, material, texture)
 * and release its GPU memory on unmount. R3F only auto-disposes objects it
 * constructs from JSX, not ones passed in as props.
 */
export function useDisposable<T extends Disposable>(factory: () => T, deps: DependencyList): T {
  // Generic wrapper: callers own the dependency list, as with useMemo itself.
  // eslint-disable-next-line react-hooks/use-memo, react-hooks/exhaustive-deps
  const value = useMemo(factory, deps);
  useEffect(() => () => value.dispose(), [value]);
  return value;
}
