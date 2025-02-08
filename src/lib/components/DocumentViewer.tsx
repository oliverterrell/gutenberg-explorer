import { useBookStore } from '@/lib/stores/BookStore';
import { useEffect, useState } from 'react';

interface Section {
  title: string;
  content: string;
}

interface Chapter {
  title: string;
  content: string;
  sections: Section[];
}

const cleanGutenbergHtml = (html: string): Chapter[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove Gutenberg boilerplate
  const boilerplate = doc.querySelectorAll('.pg-boilerplate, .pgheader, #pg-header, #pg-footer');
  boilerplate.forEach((section) => section.remove());

  // Get initial metadata
  const mainTitle = doc.querySelector('h1')?.textContent?.trim() || '';
  const author = doc.querySelector('h2')?.textContent?.trim() || '';
  const translator = doc.querySelector('h3')?.textContent?.trim() || '';

  // Start with the metadata chapter
  const chapters: Chapter[] = [
    {
      title: mainTitle,
      content: `${author}\n\n${translator}`,
      sections: [],
    },
  ];

  // Find chapters (h2s)
  const chapterElements = Array.from(doc.querySelectorAll('h2')).filter((h2) => {
    const text = h2.textContent?.trim() || '';
    return (
      !text.includes('Project Gutenberg') &&
      !text.includes('START OF') &&
      !text.includes('END OF') &&
      !text.includes('FULL LICENSE') &&
      text !== author
    );
  });

  chapterElements.forEach((chapterEl) => {
    const chapterTitle = chapterEl.textContent?.trim() || '';
    const sections: Section[] = [];
    let chapterContent = '';

    // Find all content until next chapter
    let currentNode = chapterEl.nextElementSibling;
    let currentSection: Section | null = null;

    while (currentNode && !currentNode.matches('h2')) {
      // If we hit a section header (h3)
      if (currentNode.matches('h3')) {
        // If we have accumulated chapter content before first section, save it
        if (sections.length === 0 && chapterContent.trim()) {
          sections.push({
            title: 'Introduction',
            content: chapterContent.trim(),
          });
          chapterContent = '';
        }

        // Save previous section if it exists
        if (currentSection) {
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          title: currentNode.textContent?.trim() || '',
          content: '',
        };
      }
      // Add content to current section or chapter content
      else if (currentNode.textContent?.trim()) {
        const text = currentNode.textContent.replace(/\s+/g, ' ').trim();

        if (currentSection) {
          // Add a double newline only if this is a new paragraph (p tag)
          const separator = currentNode.nodeName === 'P' ? '\n\n&ensp;' : ' ';
          currentSection.content += text + separator;
        } else {
          const separator = currentNode.nodeName === 'P' ? '\n\n' : ' ';
          chapterContent += text + separator;
        }
      }

      currentNode = currentNode.nextElementSibling;
    }

    // Don't forget the last section
    if (currentSection) {
      sections.push(currentSection);
    }

    // If we have no sections but have content, treat it as a single section
    if (sections.length === 0 && chapterContent.trim()) {
      sections.push({
        title: chapterTitle,
        content: chapterContent.trim(),
      });
    }

    chapters.push({
      title: chapterTitle,
      content: chapterContent.trim(),
      sections: sections,
    });
  });

  return chapters;
};

export const DocumentViewer = ({ html }: { html: string }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    const parsedChapters = cleanGutenbergHtml(html);
    setChapters(parsedChapters);
  }, [html]);

  if (!chapters.length) return <div>Loading...</div>;

  const chapter = chapters[currentChapter];
  const sections = chapter.sections;
  const currentContent = sections.length > 0 ? sections[currentSection].content : chapter.content;
  const currentTitle = sections.length > 0 ? sections[currentSection].title : chapter.title;

  const renderContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4">
        &emsp;{paragraph}
      </p>
    ));
  };

  return (
    <div className="mx-auto p-4">
      {/* Navigation */}
      <div className="mb-6 flex gap-4">
        <select
          className="rounded border p-2 md:w-auto"
          value={currentChapter}
          onChange={(e) => {
            setCurrentChapter(Number(e.target.value));
            setCurrentSection(0);
          }}
        >
          {chapters.map((chapter, idx) => (
            <option key={idx} value={idx}>
              {chapter.title}
            </option>
          ))}
        </select>

        {sections.length > 0 && (
          <select
            className="rounded border p-2 md:w-auto"
            value={currentSection}
            onChange={(e) => setCurrentSection(Number(e.target.value))}
          >
            {sections.map((section, idx) => (
              <option key={idx} value={idx}>
                {section.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Content */}
      <div className="w-full">
        <h2 className="mb-4 font-bold text-2xl">{chapter.title}</h2>
        {sections.length > 0 && <h3 className="mb-4 text-xl font-semibold">{currentTitle}</h3>}
        <div className="leading-relaxed">{renderContent(currentContent)}</div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (currentSection > 0) {
                setCurrentSection((prev) => prev - 1);
              } else if (currentChapter > 0) {
                setCurrentChapter((prev) => prev - 1);
                setCurrentSection(chapters[currentChapter - 1].sections.length - 1);
              }
            }}
            disabled={currentChapter === 0 && currentSection === 0}
            className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (currentSection < sections.length - 1) {
                setCurrentSection((prev) => prev + 1);
              } else if (currentChapter < chapters.length - 1) {
                setCurrentChapter((prev) => prev + 1);
                setCurrentSection(0);
              }
            }}
            disabled={currentChapter === chapters.length - 1 && currentSection === sections.length - 1}
            className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
