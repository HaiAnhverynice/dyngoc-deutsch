export interface CsvRow {
  /** 1-based line where the record starts (records may span lines inside quotes). */
  line: number;
  cells: string[];
}

/** RFC 4180 parser: quoted fields, "" escapes, embedded commas/newlines, CRLF, UTF-8 BOM. */
export function parseCsv(text: string): CsvRow[] {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: CsvRow[] = [];
  let cells: string[] = [];
  let cell = '';
  let quoted = false;
  let line = 1;
  let rowStart = 1;

  const endRow = () => {
    cells.push(cell);
    if (!(cells.length === 1 && cells[0] === '')) rows.push({ line: rowStart, cells });
    cells = [];
    cell = '';
  };

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!;
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else {
        if (ch === '\n') line++;
        cell += ch;
      }
      continue;
    }
    if (ch === '"' && cell === '') quoted = true;
    else if (ch === ',') {
      cells.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      endRow();
      line++;
      rowStart = line;
    } else cell += ch;
  }
  if (cell !== '' || cells.length > 0) endRow();
  return rows;
}

export function toCsvCell(v: string): string {
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}
