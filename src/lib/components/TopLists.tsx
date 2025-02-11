import { useBookStore } from '@/lib/stores/BookStore';
import { Book } from '@prisma/client';
import { Fragment, useLayoutEffect } from 'react';

export const TopLists = () => {
  const {
    mostRecentList,
    mostPopularList,
    setGutenbergId,
    getBook,
    getLists,
    setExplorerMenuVisible,
    userBookList,
  } = useBookStore(
    'getBook',
    'getLists',
    'mostRecentList',
    'setGutenbergId',
    'mostPopularList',
    'setExplorerMenuVisible',
    'userBookList'
  );

  const handleSelectBook = (selectedId: number) => {
    setGutenbergId(selectedId);
    getBook().then(() => {
      setExplorerMenuVisible(false);
    });
  };

  useLayoutEffect(() => {
    getLists();
  }, []);

  if (mostRecentList.length === 0 && mostPopularList.length === 0 && userBookList.length === 0) return null;

  return (
    <div>
      {userBookList.length > 0 ? (
        <Fragment>
          <div className={'mt-3 font-bold text-xl'}>Your Library</div>
          <div className={'text-sm text-gray-400'}>These are your top 30 books, ordered by most viewed</div>
          <hr className={'mb-3'} />
          <div className={'max-w-[calc(100dvw - 10%)] no-sb flex flex-row gap-x-2 overflow-x-auto'}>
            {userBookList.map((userBook: Book, i: number) => {
              return (
                <img
                  key={`user-book-${i}`}
                  src={userBook.coverArtUrl}
                  alt={userBook.title}
                  className={'cursor-pointer'}
                  onClick={() => handleSelectBook(userBook.gutenbergId)}
                />
              );
            })}
          </div>
        </Fragment>
      ) : null}

      {mostRecentList.length > 0 ? (
        <Fragment>
          <br />
          <br />
          <div className={'mt-4 font-bold text-xl'}>Recent Books</div>
          <div className={'text-sm text-gray-400'}>These are the latest books checked out by the community</div>
          <hr className={'mb-3'} />
          <div className={'max-w-[calc(100dvw - 10%)] no-sb flex flex-row gap-x-2 overflow-x-auto'}>
            {mostRecentList.map((recentBook: Book, i: number) => {
              return (
                <img
                  key={`recent-${i}`}
                  src={recentBook.coverArtUrl}
                  alt={recentBook.title}
                  className={'cursor-pointer'}
                  onClick={() => handleSelectBook(recentBook.gutenbergId)}
                />
              );
            })}
          </div>
        </Fragment>
      ) : null}

      {mostPopularList.length > 0 ? (
        <Fragment>
          <br />
          <br />
          <div className={'mt-4 font-bold text-xl'}>Most Requested Books</div>
          <div className={'text-sm text-gray-400'}>These books are the most popular!</div>
          <hr className={'mb-3'} />
          <div className={'max-w-[calc(100dvw - 10%)] no-sb flex flex-row gap-x-2 overflow-x-auto'}>
            {mostPopularList.map((popularBook: Book, i: number) => {
              return (
                <img
                  key={`popular-${i}`}
                  src={popularBook.coverArtUrl}
                  alt={popularBook.title}
                  className={'cursor-pointer'}
                  onClick={() => handleSelectBook(popularBook.gutenbergId)}
                />
              );
            })}
          </div>
        </Fragment>
      ) : null}
    </div>
  );
};
