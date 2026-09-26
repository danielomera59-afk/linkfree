-- CreateTable
CREATE TABLE "Ruleta" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadorId" TEXT NOT NULL,

    CONSTRAINT "Ruleta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Segmento" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "peso" INTEGER NOT NULL DEFAULT 1,
    "ruletaId" TEXT NOT NULL,

    CONSTRAINT "Segmento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ruleta" ADD CONSTRAINT "Ruleta_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Creador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segmento" ADD CONSTRAINT "Segmento_ruletaId_fkey" FOREIGN KEY ("ruletaId") REFERENCES "Ruleta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
