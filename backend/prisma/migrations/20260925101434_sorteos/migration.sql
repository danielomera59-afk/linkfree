-- CreateTable
CREATE TABLE "Sorteo" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "premio" TEXT NOT NULL,
    "limiteGanadores" INTEGER NOT NULL,
    "contador" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadorId" TEXT NOT NULL,

    CONSTRAINT "Sorteo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SorteoGanador" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sorteoId" TEXT NOT NULL,

    CONSTRAINT "SorteoGanador_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sorteo" ADD CONSTRAINT "Sorteo_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Creador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SorteoGanador" ADD CONSTRAINT "SorteoGanador_sorteoId_fkey" FOREIGN KEY ("sorteoId") REFERENCES "Sorteo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
