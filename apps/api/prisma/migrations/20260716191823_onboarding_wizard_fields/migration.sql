-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "latitude" DECIMAL(9,6),
ADD COLUMN     "longitude" DECIMAL(9,6);

-- AlterTable
ALTER TABLE "business_config" ADD COLUMN     "accepts_card" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "operates_online" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "operates_physical" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subrubros" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "team_size" TEXT;
