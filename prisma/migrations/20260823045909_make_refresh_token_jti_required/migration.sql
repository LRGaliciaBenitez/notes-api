/*
  Warnings:

  - A unique constraint covering the columns `[refreshTokenJti]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Made the column `refreshTokenJti` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "refreshTokenJti" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshTokenJti_key" ON "Session"("refreshTokenJti");
