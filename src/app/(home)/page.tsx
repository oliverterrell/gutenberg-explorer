'use client';

import { BookViewer } from '@/lib/components/BookViewer';
import { EPUBReader } from '@/lib/components/EPUBReader';
import { ExplorerMenu } from '@/lib/components/ExplorerMenu';
import { useBookStore } from '@/lib/stores/BookStore';
import { useLayoutEffect, useState } from 'react';
import { PersonCircle } from 'react-bootstrap-icons';
import { PageLoadSpinner } from '@/lib/components/PageLoadSpinner';
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const { gutenbergId, bookText, bookMeta, bookIsLoading, setGutenbergId, getBook } = useBookStore(
    'getBook',
    'bookText',
    'gutenbergId',
    'bookIsLoading',
    'setGutenbergId',
    'bookMeta'
  );

  const [logoutMenuVisible, setLogoutMenuVisible] = useState(false);

  const gutenbergIdParamString = useSearchParams().get('gid');
  const gutenbergIdParam = gutenbergIdParamString ? parseInt(gutenbergIdParamString) : null;

  useLayoutEffect(() => {
    if (gutenbergIdParam && !Number.isNaN(gutenbergIdParam)) {
      setGutenbergId(gutenbergIdParam);
      getBook();
    }
  }, [gutenbergIdParam]);

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

      {bookMeta?.formats ? (
        <div className={`w-[60%]`}>
          <EPUBReader url={bookMeta.formats['application/epub+zip']} />
          {/*<BookViewer bookText={bookText} />*/}
        </div>
      ) : null}
    </div>
  );
}
