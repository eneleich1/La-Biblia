-- CreateTable
CREATE TABLE "ApologeticaVideo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApologeticaVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApologeticaVideo_position_idx" ON "ApologeticaVideo"("position");
