import { apiClient } from '@/lib/clients/apiClient';
import { zustandFactory } from '@/lib/stores/zustandFactory';

const createBookStore = (set: any, get: any) => {
  return {
    bookIsLoading: false,
    setBookIsLoading: (bookIsLoading: boolean) => set({ bookIsLoading }),

    gutenbergId: null as number,
    setGutenbergId: (gutenbergId: number | null) => {
      set({ gutenbergId: Number.isNaN(gutenbergId) ? null : gutenbergId });
    },

    bookText: null as string,
    setBookText: (bookText: any) => set({ bookText }),
    bookMeta: null as any,
    setBookMeta: (bookMeta: object) => set({ bookMeta }),

    getBook: async () => {
      const { gutenbergId } = get();

      set({ bookIsLoading: true });

      const { data } = await apiClient.get(`/gutenberg-book`, { params: { gutenbergId } });

      console.log(data);
      set({ bookText: data.text, bookMeta: data.meta, bookIsLoading: false });
    },
  };
};

export type BookStore = ReturnType<typeof createBookStore>;
export const useBookStore: (...args: (keyof BookStore)[]) => BookStore =
  zustandFactory<BookStore>(createBookStore);
