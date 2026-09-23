-- CreateTable
CREATE TABLE "Creador" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Creador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadorId" TEXT NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Creador_usuario_key" ON "Creador"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Creador_email_key" ON "Creador"("email");

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Creador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
