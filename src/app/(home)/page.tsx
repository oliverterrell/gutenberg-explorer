'use client';

import { Button, ButtonType } from '@/lib/components/Button';
import { EPUBReader } from '@/lib/components/EPUBReader';
import { ExplorerMenu } from '@/lib/components/ExplorerMenu';
import { PageLoadSpinner } from '@/lib/components/PageLoadSpinner';
import { TopLists } from '@/lib/components/TopLists';
import { LS_LOGIN_PAGE_TOAST } from '@/lib/constants';
import { useToast } from '@/lib/hooks/useToast';
import { AuthService } from '@/lib/services/AuthService';
import { useBookStore } from '@/lib/stores/BookStore';
import { useState } from 'react';
import { PersonCircle } from 'react-bootstrap-icons';

export default function Home() {
  const { setToast } = useToast();

  const { book, bookIsLoading } = useBookStore('bookIsLoading', 'book');

  const [logoutMenuVisible, setLogoutMenuVisible] = useState(false);

  const handleLogout = async () => {
    setLogoutMenuVisible(false);
    await AuthService.logout();
    setToast({ type: 'success', message: 'Signed out' }, LS_LOGIN_PAGE_TOAST);
    window.location.reload();
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
          <div
            className={`absolute -translate-x-12 translate-y-5 border border-gray-400 bg-white px-4 py-2 drop-shadow-md ${logoutMenuVisible ? '' : 'hidden'}`}
          >
            <Button
              onClick={handleLogout}
              type={ButtonType.LINK}
              text={'Logout'}
              className={`text-xl text-gray-800 underline underline-offset-2`}
            />
          </div>
        </div>
      </div>

      {book ? <EPUBReader book={book} /> : <TopLists />}
    </div>
  );
}
