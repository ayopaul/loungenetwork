/*
  Warnings:

  - A unique constraint covering the columns `[slug,stationId]` on the table `OAP` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OAP" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OAP_slug_stationId_key" ON "OAP"("slug", "stationId");
