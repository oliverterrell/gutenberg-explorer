import { apiClient } from '@/lib/clients/apiClient';
import { zustandFactory } from '@/lib/stores/zustandFactory';
import { Book } from '@prisma/client';

const createBookStore = (set: any, get: any) => {
  return {
    bookIsLoading: false,
    setBookIsLoading: (bookIsLoading: boolean) => set({ bookIsLoading }),

    gutenbergId: null as number,
    setGutenbergId: (gutenbergId: number | null) => {
      set({ gutenbergId: Number.isNaN(gutenbergId) ? null : gutenbergId });
    },

    book: null as Book,
    setBook: (bookText: any) => set({ bookText }),

    getBook: async () => {
      const { gutenbergId } = get();

      set({ bookIsLoading: true });

      const { data } = await apiClient.get(`/gutenberg-book`, { params: { gutenbergId } });

      console.log(data);
      set({ book: data.book, bookIsLoading: false });
    },
  };
};

export type BookStore = ReturnType<typeof createBookStore>;
export const useBookStore: (...args: (keyof BookStore)[]) => BookStore =
  zustandFactory<BookStore>(createBookStore);
