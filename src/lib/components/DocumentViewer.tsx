'use client';

import { useEffect, useState } from 'react';

interface GutenbergDocument {
  title: string;
  content: string;
}

function parseGutenbergDocuments(text: string): GutenbergDocument[] {
  // Match pattern: **The Project Gutenberg Etext of TITLE**
  // const titleRegex = /\*\*The Project Gutenberg Etext of ([^*]+)\*\*/g;
  const titleRegex = /\*\*([^*]+)\*\*/g;
  const documents: GutenbergDocument[] = [];

  let match;
  let lastIndex = 0;

  while ((match = titleRegex.exec(text)) !== null) {
    if (lastIndex > 0) {
      const prevMatch = documents[documents.length - 1];

      let content = text
        .slice(lastIndex, match.index)
        .trim()
        .replace(/\*\*\*.*?\*\*\*/g, '')
        .replace(/\[.*?\]/g, '')
        .replaceAll('*', '')
        .trim();

      content += '.';

      prevMatch.content = content;
    }

    documents.push({
      title: match[1].trim(),
      content: '',
    });

    lastIndex = match.index + match[0].length;
  }

  if (documents.length > 0) {
    const lastDoc = documents[documents.length - 1];
    lastDoc.content = text
      .slice(lastIndex)
      .split(/\*\*\*END.*$/m)[0]
      .replaceAll('***', '')
      .replaceAll('**', '')
      .trim();
  }

  console.log('DOCUMENTS', documents);

  return documents;
}

export const DocumentViewer = ({ text }: { text: string }) => {
  const [documents, setDocuments] = useState<GutenbergDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<number>(0);

  useEffect(() => {
    const parsedDocs = parseGutenbergDocuments(text);
    setDocuments(parsedDocs);
  }, [text]);

  if (documents.length === 0) return <div>Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <select
          className="rounded border p-2"
          value={selectedDoc}
          onChange={(e) => setSelectedDoc(Number(e.target.value))}
        >
          {documents.map((doc, idx) => (
            <option key={idx} value={idx}>
              {doc.title}
            </option>
          ))}
        </select>
      </div>

      {/* Document content */}
      <div className="prose">
        <h2 className="mb-4 font-bold text-2xl">{documents[selectedDoc].title}</h2>
        {documents[selectedDoc].content.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="mb-4">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};
