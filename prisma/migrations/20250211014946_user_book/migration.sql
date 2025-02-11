-- CreateTable
CREATE TABLE "user_book" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_book_user_id_idx" ON "user_book"("user_id");

-- CreateIndex
CREATE INDEX "user_book_book_id_idx" ON "user_book"("book_id");

-- AddForeignKey
ALTER TABLE "user_book" ADD CONSTRAINT "user_book_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_book" ADD CONSTRAINT "user_book_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
