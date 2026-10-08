export function cleanHeading(text) {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
}

export function pageStatusKey(relativePath) {
  return relativePath.replace(/\.md$/, '').replace(/\/index$/, '');
}

export function importedStatusItems(input) {
  if (!input || !input.items || typeof input.items !== 'object' || Array.isArray(input.items)) throw new Error('学习状态文件格式不正确');
  const values = new Set(['none', 'doing', 'done', 'later']);
  return Object.fromEntries(Object.entries(input.items).filter(([key, value]) => typeof key === 'string' && values.has(value)));
}

export function headingStatus(items, pageKey, rawText) {
  const clean = cleanHeading(rawText);
  const priorVite = rawText.replace(/\s+/g, ' ').trim();
  return items[`${pageKey}#${clean}`] ?? items[`${pageKey}#${priorVite}`] ?? items[clean] ?? 'none';
}
