import { Book } from '@prisma/client';
import { useState } from 'react';
import { ReactReader } from 'react-reader';

export const EPUBReader = ({ book }: { book: Book }) => {
  const [location, setLocation] = useState(null);
  return (
    <div className="mx-auto h-screen max-w-4xl">
      <div className="h-[700px] w-[600px]">
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
