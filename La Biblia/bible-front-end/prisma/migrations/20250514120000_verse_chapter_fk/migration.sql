-- Link each verse to its Chapter row (referential integrity).

ALTER TABLE "Verse" ADD COLUMN "chapterId" TEXT;

UPDATE "Verse" AS v
SET "chapterId" = c.id
FROM "Chapter" AS c
WHERE c."bookId" = v."bookId"
  AND c."number" = v."chapterNumber";

ALTER TABLE "Verse" ALTER COLUMN "chapterId" SET NOT NULL;

ALTER TABLE "Verse" ADD CONSTRAINT "Verse_chapterId_fkey"
  FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Verse_chapterId_idx" ON "Verse"("chapterId");
