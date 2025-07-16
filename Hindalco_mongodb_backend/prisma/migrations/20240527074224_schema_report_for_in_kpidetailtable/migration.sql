-- CreateTable
CREATE TABLE `UserTest` (
    `id` VARCHAR(191) NOT NULL,
    `kcId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `firstname` VARCHAR(191) NULL,
    `lastname` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedBy` VARCHAR(191) NULL,
    `enabled` BOOLEAN NULL,
    `organizationId` VARCHAR(191) NULL,
    `locationId` VARCHAR(191) NULL,
    `entityId` VARCHAR(191) NULL,
    `userType` VARCHAR(191) NULL,
    `status` BOOLEAN NULL,
    `avatar` VARCHAR(191) NULL,
    `deleted` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reportKpiDataNewData` (
    `id` VARCHAR(191) NOT NULL,
    `kpiTemplateId` VARCHAR(191) NOT NULL,
    `kpiCategoryId` VARCHAR(191) NOT NULL,
    `kpiId` VARCHAR(191) NOT NULL,
    `kraId` VARCHAR(191) NULL,
    `kpiLocation` VARCHAR(191) NULL,
    `kpiOrganization` VARCHAR(191) NULL,
    `kpiEntity` VARCHAR(191) NULL,
    `kpibusiness` VARCHAR(191) NULL,
    `kpiValue` DOUBLE NOT NULL,
    `kpiComments` VARCHAR(191) NULL,
    `kpiTargetType` VARCHAR(191) NULL,
    `minimumTarget` DOUBLE NULL,
    `target` DOUBLE NULL,
    `kpiWeightage` DOUBLE NULL,
    `kpiScore` DOUBLE NULL,
    `kpiVariance` DOUBLE NULL,
    `percentage` DOUBLE NULL,
    `kpiStatus` VARCHAR(191) NULL,
    `reportDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reportFor` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kpiSummary` (
    `id` VARCHAR(191) NOT NULL,
    `kpiId` VARCHAR(191) NOT NULL,
    `kraId` VARCHAR(191) NULL,
    `objectiveId` VARCHAR(191) NULL,
    `kpiEntity` VARCHAR(191) NULL,
    `kpibusiness` VARCHAR(191) NULL,
    `kpiLocation` VARCHAR(191) NULL,
    `kpiOrganization` VARCHAR(191) NULL,
    `kpiMonthYear` INTEGER NULL,
    `monthlySum` DOUBLE NULL,
    `monthlyAverage` DOUBLE NULL,
    `monthlyVariance` DOUBLE NULL,
    `monthlyTarget` DOUBLE NULL,
    `monthlyWeightedScore` DOUBLE NULL,
    `percentage` DOUBLE NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `kpiYear` INTEGER NULL,
    `kpiPeriod` INTEGER NULL,

    UNIQUE INDEX `kpiSummary_id_key`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
