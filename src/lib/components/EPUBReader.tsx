import { useState } from 'react';
import { ReactReader } from 'react-reader';

export const EPUBReader = ({ url }) => {
  const [location, setLocation] = useState(null);

  return (
    <div className="mx-auto h-screen max-w-4xl">
      <div className="h-[calc(100vh-2rem)]">
        <ReactReader
          url={`https://www.gutenberg.org/ebooks/1738.epub3.images`}
          location={location}
          locationChanged={(loc) => setLocation(loc)}
          showToc={true}
        />
      </div>
    </div>
  );
};
