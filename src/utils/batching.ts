export interface BatchableText {
  original: string;
  protectedText?: string;
}

export function translationTextLength(item: BatchableText): number {
  return (item.protectedText || item.original).length;
}

export function createTranslationBatches<T extends BatchableText>(
  items: T[],
  maxItems: number,
  maxCharacters: number
): T[][] {
  if (!Number.isInteger(maxItems) || maxItems < 1) {
    throw new Error("maxItems deve ser um número inteiro positivo.");
  }
  if (!Number.isInteger(maxCharacters) || maxCharacters < 1) {
    throw new Error("maxCharacters deve ser um número inteiro positivo.");
  }

  const batches: T[][] = [];
  let batch: T[] = [];
  let characters = 0;

  for (const item of items) {
    const itemCharacters = translationTextLength(item);
    const wouldExceedItems = batch.length >= maxItems;
    const wouldExceedCharacters = batch.length > 0 && characters + itemCharacters > maxCharacters;
    if (wouldExceedItems || wouldExceedCharacters) {
      batches.push(batch);
      batch = [];
      characters = 0;
    }
    batch.push(item);
    characters += itemCharacters;
  }

  if (batch.length > 0) batches.push(batch);
  return batches;
}
