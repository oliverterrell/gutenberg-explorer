import { useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

export const zustandFactory = <TStore extends object>(createStore: (set: any, get: any) => TStore) => {
  const useStoreBase = createWithEqualityFn<TStore>(createStore);

  return <K extends keyof TStore>(...keys: K[]): TStore => {
    const selector = useMemo(() => {
      if (keys.length === 0) {
        return () => useStoreBase() as TStore;
      }
      return (state: TStore) => {
        const result = {} as TStore;
        keys.forEach((key) => {
          result[key] = state[key];
        });
        return result;
      };
    }, [keys.length === 0 ? Math.random() : keys.join(',')]);

    return useStoreBase(selector as () => TStore, shallow);
  };
};
