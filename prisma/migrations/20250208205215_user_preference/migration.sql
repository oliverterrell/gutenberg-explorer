/*
  Warnings:

  - Made the column `email` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "preference" JSONB NOT NULL DEFAULT '{}',
ALTER COLUMN "email" SET NOT NULL;
