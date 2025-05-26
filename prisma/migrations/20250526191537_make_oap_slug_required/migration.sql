/*
  Warnings:

  - Made the column `slug` on table `OAP` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "OAP" ALTER COLUMN "slug" SET NOT NULL;
