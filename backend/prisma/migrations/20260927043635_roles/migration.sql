-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'USUARIO');

-- AlterTable
ALTER TABLE "Creador" ADD COLUMN     "rol" "Rol" NOT NULL DEFAULT 'USUARIO';
