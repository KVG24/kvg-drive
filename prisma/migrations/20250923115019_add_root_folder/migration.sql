/*
  Warnings:

  - A unique constraint covering the columns `[rootFolderId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rootFolderId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "rootFolderId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_rootFolderId_key" ON "public"."User"("rootFolderId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_rootFolderId_fkey" FOREIGN KEY ("rootFolderId") REFERENCES "public"."Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
