import { useBookStore } from '@/lib/stores/BookStore';
import { useState } from 'react';
import { ReactReader } from 'react-reader';

export const EPUBReader = () => {
  const { book } = useBookStore('book');

  const [location, setLocation] = useState(null);

  if (!book) return null;

  return (
    <div className="mx-auto h-screen max-w-4xl">
      <div className="mt-4 h-[700px] w-[600px] bg-orange-100 shadow-all-md shadow-gray-200">
        <ReactReader
          url={book.eBookUrl}
          location={location}
          locationChanged={(loc) => setLocation(loc)}
          showToc={true}
        />
      </div>
    </div>
  );
};
