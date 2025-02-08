/*
  Warnings:

  - You are about to drop the `AiModel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "AiModel";

-- CreateTable
CREATE TABLE "ai_model" (
    "id" UUID NOT NULL,
    "model" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ai_model_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_model_model_key" ON "ai_model"("model");

-- CreateIndex
CREATE INDEX "ai_model_model_idx" ON "ai_model"("model");
