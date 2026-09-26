-- CreateTable
CREATE TABLE "Referido" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "enlace" TEXT NOT NULL,
    "mensaje" TEXT,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadorId" TEXT NOT NULL,

    CONSTRAINT "Referido_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Referido" ADD CONSTRAINT "Referido_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Creador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
