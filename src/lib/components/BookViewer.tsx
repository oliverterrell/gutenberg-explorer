import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';

export const BookViewer = ({ bookText }) => {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    // Clean the text first
    const cleanText = bookText
      .replace(/^[\s\S]*?\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG.*?\*\*\*/, '')
      .replace(/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG.*?[\s\S]*$/, '')
      .trim();

    // Split into paragraphs and filter out empty ones
    const paragraphs = cleanText
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);

    // Create pages with roughly 15 paragraphs each
    // (we can adjust this number based on testing)
    const PARAGRAPHS_PER_PAGE = 15;
    const newPages = [];

    for (let i = 0; i < paragraphs.length; i += PARAGRAPHS_PER_PAGE) {
      newPages.push(paragraphs.slice(i, i + PARAGRAPHS_PER_PAGE));
    }

    console.log(`Created ${newPages.length} pages`); // Debug log
    setPages(newPages);
  }, [bookText]);

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [pages.length]);

  if (!pages.length) return null;

  return (
    <div className="mx-auto max-w-2xl p-4">
      {/* Content container */}
      <div ref={containerRef} className="h-[37.9rem] overflow-hidden rounded-lg bg-white p-8 shadow-lg">
        <div className="prose max-w-none font-serif">
          {pages[currentPage]?.map((paragraph, i) => (
            <p key={i} className="mb-4 whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 0}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <span className="text-sm text-gray-600">
          Page {currentPage + 1} of {pages.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPage === pages.length - 1}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-gray-100"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
