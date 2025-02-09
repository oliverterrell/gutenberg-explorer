/*
  Warnings:

  - Changed the type of `gutenberg_id` on the `book` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "book" DROP COLUMN "gutenberg_id",
ADD COLUMN     "gutenberg_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "book_gutenberg_id_key" ON "book"("gutenberg_id");

-- CreateIndex
CREATE INDEX "book_gutenberg_id_idx" ON "book"("gutenberg_id");
