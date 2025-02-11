/*
  Warnings:

  - A unique constraint covering the columns `[user_id,book_id]` on the table `user_book` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_book_user_id_book_id_key" ON "user_book"("user_id", "book_id");
