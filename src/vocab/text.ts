/** Lowercase, ß→ss, đ→d, strip diacritics: "Häuser" → "hauser", "bàn" → "ban". */
export function fold(s: string): string {
  return s
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** German transliteration: "Häuser" → "haeuser" (so typing "ae" also finds "ä"). */
export function foldGerman(s: string): string {
  return fold(s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue'));
}

export function slugify(s: string): string {
  return foldGerman(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
