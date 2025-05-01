/*
  Warnings:

  - You are about to drop the column `fqdn` on the `Node` table. All the data in the column will be lost.
  - Added the required column `identifier` to the `Node` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Node` DROP COLUMN `fqdn`,
    ADD COLUMN `identifier` VARCHAR(191) NOT NULL;
