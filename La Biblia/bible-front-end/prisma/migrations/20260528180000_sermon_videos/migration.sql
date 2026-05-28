-- CreateTable
CREATE TABLE "SermonVideo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SermonVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SermonVideo_position_idx" ON "SermonVideo"("position");
