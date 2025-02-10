import { useBookStore } from '@/lib/stores/BookStore';
import { Book } from '@prisma/client';
import { Fragment } from 'react';

export const TopLists = () => {
  const { mostRecentList, mostPopularList, setGutenbergId, getBook } = useBookStore(
    'getBook',
    'mostRecentList',
    'setGutenbergId',
    'mostPopularList'
  );

  const handleSelectBook = (selectedId: number) => {
    setGutenbergId(selectedId);
    getBook();
  };

  if (mostRecentList.length === 0 && mostPopularList.length === 0) return null;

  return (
    <div>
      {mostRecentList.length > 0 ? (
        <Fragment>
          <div className={'mt-3 font-bold text-xl'}>Recent Books</div>
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
