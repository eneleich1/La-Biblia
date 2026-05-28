import type { SiteBlock } from "@/lib/clientSiteBuilder";

export function findBlockPath(
  blocks: SiteBlock[],
  id: string,
  parentId: string | null = null,
): { blocks: SiteBlock[]; parentId: string | null; index: number } | null {
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (block.id === id) return { blocks, parentId, index };
    if (block.type === "container" && block.children?.length) {
      const nested = findBlockPath(block.children, id, block.id);
      if (nested) return nested;
    }
  }
  return null;
}

export function updateBlockById(
  blocks: SiteBlock[],
  id: string,
  updater: (block: SiteBlock) => SiteBlock,
): SiteBlock[] {
  return blocks.map((block) => {
    if (block.id === id) return updater(block);
    if (block.type === "container" && block.children) {
      return { ...block, children: updateBlockById(block.children, id, updater) };
    }
    return block;
  });
}

export function removeBlockById(blocks: SiteBlock[], id: string): SiteBlock[] {
  return blocks
    .filter((block) => block.id !== id)
    .map((block) =>
      block.type === "container" && block.children
        ? { ...block, children: removeBlockById(block.children, id) }
        : block,
    );
}

export function getCanvasHeight(blocks: SiteBlock[], min = 480) {
  let max = min;
  const walk = (items: SiteBlock[]) => {
    for (const block of items) {
      const bottom = block.layout.y + block.layout.height;
      if (bottom > max) max = bottom;
      if (block.type === "container" && block.children) walk(block.children);
    }
  };
  walk(blocks);
  return max + 48;
}
