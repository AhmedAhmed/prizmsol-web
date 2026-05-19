/** Fixed-size chunks for embedding; tune `maxChars` to your model context budget. */
export function chunkText(text: string, maxChars = 1200): string[] {
    const normalized = text.replace(/\r\n/g, '\n').trim();
    if (!normalized) {
        return [];
    }
    const chunks: string[] = [];
    for (let i = 0; i < normalized.length; i += maxChars) {
        chunks.push(normalized.slice(i, i + maxChars));
    }
    return chunks;
}
