/*
  Warnings:

  - You are about to alter the column `objectiveId` on the `kpisummary` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `kpisummary` MODIFY `objectiveId` JSON NULL;

-- AlterTable
ALTER TABLE `reportkpidatanewdata` ADD COLUMN `objectiveId` JSON NULL;
