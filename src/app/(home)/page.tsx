'use client';

import { EPUBReader } from '@/lib/components/EPUBReader';
import { ExplorerMenu } from '@/lib/components/ExplorerMenu';
import { useBookStore } from '@/lib/stores/BookStore';
import { useState } from 'react';
import { PersonCircle } from 'react-bootstrap-icons';
import { PageLoadSpinner } from '@/lib/components/PageLoadSpinner';

export default function Home() {
  const { book, bookIsLoading } = useBookStore('bookIsLoading', 'book');

  const [logoutMenuVisible, setLogoutMenuVisible] = useState(false);

  const logout = () => {
    setLogoutMenuVisible(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start p-8">
      <PageLoadSpinner isLoading={bookIsLoading} />
      <div className={'flex h-14 w-screen flex-row justify-between border-b border-gray-400'}>
        <ExplorerMenu />
        <div className={'absolute right-5'}>
          <PersonCircle
            className={'translate-y-2 cursor-pointer text-2xl text-gray-800'}
            onClick={() => setLogoutMenuVisible((prev) => !prev)}
          />
        </div>
      </div>

      {book ? <EPUBReader book={book} /> : null}
    </div>
  );
}
