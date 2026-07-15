-- AlterTable
ALTER TABLE "members" ADD COLUMN     "invitation_token" TEXT,
ADD COLUMN     "invitation_token_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "members_invitation_token_key" ON "members"("invitation_token");

