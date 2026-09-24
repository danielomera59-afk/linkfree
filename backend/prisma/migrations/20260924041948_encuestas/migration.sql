-- CreateTable
CREATE TABLE "Encuesta" (
    "id" TEXT NOT NULL,
    "pregunta" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadorId" TEXT NOT NULL,

    CONSTRAINT "Encuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpcionEncuesta" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "votos" INTEGER NOT NULL DEFAULT 0,
    "encuestaId" TEXT NOT NULL,

    CONSTRAINT "OpcionEncuesta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Encuesta" ADD CONSTRAINT "Encuesta_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Creador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpcionEncuesta" ADD CONSTRAINT "OpcionEncuesta_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "Encuesta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
