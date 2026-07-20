-- DropIndex
DROP INDEX "members_auth_user_id_key";

-- DropIndex
DROP INDEX "platform_admins_auth_user_id_key";

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "auth_user_id";

-- AlterTable
ALTER TABLE "members" DROP COLUMN "auth_user_id";

-- AlterTable
ALTER TABLE "platform_admins" DROP COLUMN "auth_user_id";
