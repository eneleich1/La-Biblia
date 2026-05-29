-- CreateTable
CREATE TABLE "SaintsCultExampleVideo" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tag" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaintsCultExampleVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SaintsCultExampleVideo_topicId_position_idx" ON "SaintsCultExampleVideo"("topicId", "position");
