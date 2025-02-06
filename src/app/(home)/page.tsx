'use client';

import { apiClient } from '@/lib/clients/apiClient';
import { DocumentViewer } from '@/lib/components/DocumentViewer';
import { useEffect, useState } from 'react';

export default function Home() {
  const [bookText, setBookText] = useState('');
  const [bookId, setBookId] = useState(1738);

  useEffect(() => {
    const getBook = async () => {
      const { data } = await apiClient.get(`/test`, { params: { bookId } });

      console.log(data.meta);
      console.log(data.text.slice(0, 1000));

      setBookText(data.text);
    };

    getBook();
  }, [bookId]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button onClick={() => setBookId((prev) => prev + 1)} className={`rounded-sm border border-black p-2`}>
        Next book
      </button>
      {typeof bookText === 'string' ? <DocumentViewer text={bookText} /> : null}
    </main>
  );
}
