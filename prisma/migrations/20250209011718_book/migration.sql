-- CreateTable
CREATE TABLE "book" (
    "id" UUID NOT NULL,
    "gutenberg_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "e_book_url" TEXT,
    "cover_art_url" TEXT,
    "plain_text_url" TEXT,
    "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "authors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "translators" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bookshelves" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "copyright" BOOLEAN,
    "summaries" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "book_gutenberg_id_key" ON "book"("gutenberg_id");

-- CreateIndex
CREATE INDEX "book_gutenberg_id_idx" ON "book"("gutenberg_id");
