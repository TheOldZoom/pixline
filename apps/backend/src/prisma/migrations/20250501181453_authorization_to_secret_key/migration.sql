/*
  Warnings:

  - You are about to drop the column `authorization` on the `Node` table. All the data in the column will be lost.
  - Added the required column `secret_key` to the `Node` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Node` DROP COLUMN `authorization`,
    ADD COLUMN `secret_key` VARCHAR(191) NOT NULL;
