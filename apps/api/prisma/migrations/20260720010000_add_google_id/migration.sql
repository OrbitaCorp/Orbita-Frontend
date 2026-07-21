-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "google_id" TEXT;

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "google_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "customers_business_id_google_id_key" ON "customers"("business_id", "google_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_business_id_google_id_key" ON "members"("business_id", "google_id");
