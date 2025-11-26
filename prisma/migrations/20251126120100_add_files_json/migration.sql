/*
  Warnings:

  - You are about to drop the column `generatedCode` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "generatedCode",
ADD COLUMN     "files" JSONB;
