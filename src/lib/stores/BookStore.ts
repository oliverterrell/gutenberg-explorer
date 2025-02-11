import { apiClient } from '@/lib/clients/apiClient';
import { zustandFactory } from '@/lib/stores/zustandFactory';
import { Book } from '@prisma/client';

const createBookStore = (set: any, get: any) => {
  return {
    explorerMenuVisible: false,
    setExplorerMenuVisible: (explorerMenuVisible: boolean) => set({ explorerMenuVisible }),

    bookIsLoading: false,
    setBookIsLoading: (bookIsLoading: boolean) => set({ bookIsLoading }),

    gutenbergId: null as number,
    setGutenbergId: (gutenbergId: number | null) => {
      set({ gutenbergId: Number.isNaN(gutenbergId) ? null : gutenbergId });
    },

    book: null as Book,
    setBook: (book: Book) => set({ book, gutenbergId: null }),

    getBook: async () => {
      const { gutenbergId } = get();

      set({ bookIsLoading: true });

      const { data } = await apiClient.get(`/gutenberg-book`, { params: { gutenbergId } });

      set({ book: data.book, bookIsLoading: false });
    },

    mostPopularList: [] as Book[],
    mostRecentList: [] as Book[],
    userBookList: [] as Book[],

    getLists: async () => {
      try {
        const { data } = await apiClient.get(`/list`);
        set({ mostPopularList: data.mostPopular, mostRecentList: data.mostRecent, userBookList: data.userBooks });
      } catch (error) {
        console.log(error);
      }
    },
  };
};

export type BookStore = ReturnType<typeof createBookStore>;
export const useBookStore: (...args: (keyof BookStore)[]) => BookStore =
  zustandFactory<BookStore>(createBookStore);
