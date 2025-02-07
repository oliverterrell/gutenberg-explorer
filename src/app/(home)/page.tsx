'use client';

import { apiClient } from '@/lib/clients/apiClient';
import { DocumentViewer } from '@/lib/components/DocumentViewer';
import { useEffect, useState } from 'react';

export default function Home() {
  const [bookHtml, setBookHtml] = useState(null);
  const [bookId, setBookId] = useState(1);

  useEffect(() => {
    const getBook = async () => {
      const { data } = await apiClient.get(`/test`, { params: { bookId } });

      // console.log(data.meta);
      // console.log(data.html);

      setBookHtml(data.html);
    };

    getBook();
  }, [bookId]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-between p-8">
      <button
        onClick={() => setBookId((prev) => prev + 1)}
        className={`rounded-sm border border-black px-3 py-1.5 leading-snug`}
      >
        Next book
      </button>
      <div className={`w-[70%]`}>{bookHtml ? <DocumentViewer html={bookHtml} /> : null}</div>
    </div>
  );
}
