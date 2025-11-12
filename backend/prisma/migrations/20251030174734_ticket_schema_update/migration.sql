/*
  Warnings:

  - You are about to drop the column `status` on the `Ticket` table. All the data in the column will be lost.
  - The `status` column on the `TicketAssignment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId,ticketId]` on the table `TicketAssignment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `TicketAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TicketOverallStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED');

-- DropForeignKey
ALTER TABLE "public"."TicketAssignment" DROP CONSTRAINT "TicketAssignment_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TicketAssignment" DROP CONSTRAINT "TicketAssignment_userId_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "status",
ADD COLUMN     "overallStatus" "TicketOverallStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "TicketAssignment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "TicketStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "public"."Status";

-- CreateIndex
CREATE INDEX "TicketAssignment_userId_idx" ON "TicketAssignment"("userId");

-- CreateIndex
CREATE INDEX "TicketAssignment_ticketId_idx" ON "TicketAssignment"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketAssignment_userId_ticketId_key" ON "TicketAssignment"("userId", "ticketId");

-- AddForeignKey
ALTER TABLE "TicketAssignment" ADD CONSTRAINT "TicketAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketAssignment" ADD CONSTRAINT "TicketAssignment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
