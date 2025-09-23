-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_rootFolderId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "rootFolderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_rootFolderId_fkey" FOREIGN KEY ("rootFolderId") REFERENCES "public"."Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
