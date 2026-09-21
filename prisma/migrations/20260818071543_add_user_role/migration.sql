-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MASTER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
