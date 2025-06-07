-- DropForeignKey
ALTER TABLE `Shard` DROP FOREIGN KEY `Shard_nodeId_fkey`;

-- DropIndex
DROP INDEX `Shard_nodeId_fkey` ON `Shard`;

-- AddForeignKey
ALTER TABLE `Shard` ADD CONSTRAINT `Shard_nodeId_fkey` FOREIGN KEY (`nodeId`) REFERENCES `Node`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
