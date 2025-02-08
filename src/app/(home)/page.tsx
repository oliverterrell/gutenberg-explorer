'use client';

import { DocumentViewer } from '@/lib/components/DocumentViewer';
import { ExplorerMenu } from '@/lib/components/ExplorerMenu';
import { useBookStore } from '@/lib/stores/BookStore';
import { useState } from 'react';
import { PersonCircle } from 'react-bootstrap-icons';

export default function Home() {
  const { bookHtml } = useBookStore();

  const [logoutMenuVisible, setLogoutMenuVisible] = useState(false);

  const logout = () => {
    setLogoutMenuVisible(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start p-8">
      <div className={'flex h-14 w-screen flex-row justify-between border-b border-gray-400'}>
        <ExplorerMenu />
        <div className={'absolute right-5'}>
          <PersonCircle
            className={'translate-y-2 cursor-pointer text-2xl text-gray-800'}
            onClick={() => setLogoutMenuVisible((prev) => !prev)}
          />
        </div>
      </div>

      {bookHtml ? (
        <div className={`w-[60%]`}>
          <DocumentViewer html={bookHtml} />
        </div>
      ) : null}
    </div>
  );
}
