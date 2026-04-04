import { parse, isValid } from "date-fns";
import { PDFParse } from "pdf-parse";

const DATE_REGEX = /\b(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}|\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2})\b/g;

const FORMATS = [
  "dd/MM/yyyy",
  "d/M/yyyy",
  "dd-MM-yyyy",
  "d-M-yyyy",
  "dd.MM.yyyy",
  "d.M.yyyy",
  "MM/dd/yyyy",
  "M/d/yyyy",
  "yyyy-MM-dd",
  "yyyy/MM/dd",
  "dd/MM/yy",
  "MM/dd/yy",
];

const HEBREW_DELIVERY_APPROVAL_CUE_REGEX = "אישור\\s+המסירה\\s+בתוקף\\s+מ\\s*[:\\-\\u05C3]?";

function extractDateRangesByHebrewCue(text: string) {
  const datePattern = "(\\d{1,2}[\\/.-]\\d{1,2}[\\/.-]\\d{2,4}|\\d{4}[\\/.-]\\d{1,2}[\\/.-]\\d{1,2})";
  const pattern = new RegExp(`${HEBREW_DELIVERY_APPROVAL_CUE_REGEX}\\s*${datePattern}[^\\d]{0,20}${datePattern}`, "g");

  const ranges: { startDate: Date; expirationDate: Date }[] = [];

  for (const match of text.matchAll(pattern)) {
    const rawStart = match[1];
    const rawExpiration = match[2];

    const startDate = parseCandidateDate(rawStart);
    const expirationDate = parseCandidateDate(rawExpiration);

    if (!startDate || !expirationDate) {
      continue;
    }

    if (expirationDate.getTime() < startDate.getTime()) {
      continue;
    }

    ranges.push({ startDate, expirationDate });
  }

  return ranges;
}

function parseCandidateDate(value: string): Date | null {
  const normalized = value.trim();

  for (const format of FORMATS) {
    const parsed = parse(normalized, format, new Date());
    if (isValid(parsed)) {
      return parsed;
    }
  }

  return null;
}

export function detectDatesFromText(text: string) {
  const cueRanges = extractDateRangesByHebrewCue(text);
  if (cueRanges.length) {
    const firstRange = cueRanges[0];
    const candidates = cueRanges.flatMap((range) => [range.startDate, range.expirationDate]);

    return {
      startDate: firstRange.startDate,
      expirationDate: firstRange.expirationDate,
      confidence: 0.95,
      candidates,
    };
  }

  const dateMatches = [...text.matchAll(DATE_REGEX)].map((m) => m[0]);
  const parsedDates = dateMatches
    .map(parseCandidateDate)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  const unique = parsedDates.filter(
    (date, index, arr) =>
      arr.findIndex((compare) => compare.toISOString().slice(0, 10) === date.toISOString().slice(0, 10)) ===
      index,
  );

  const startDate = unique[0] ?? null;
  const expirationDate = unique[1] ?? unique[0] ?? null;
  const confidence = unique.length >= 2 ? 0.8 : unique.length === 1 ? 0.4 : 0;

  return { startDate, expirationDate, confidence, candidates: unique };
}

export function detectMonthlyDateRangesFromText(text: string) {
  const cueRanges = extractDateRangesByHebrewCue(text);
  if (cueRanges.length) {
    return cueRanges;
  }

  const parsed = detectDatesFromText(text);
  const ranges: { startDate: Date; expirationDate: Date }[] = [];

  for (let i = 0; i < parsed.candidates.length - 1; i += 2) {
    const startDate = parsed.candidates[i];
    const expirationDate = parsed.candidates[i + 1];

    if (expirationDate.getTime() >= startDate.getTime()) {
      ranges.push({ startDate, expirationDate });
    }
  }

  // Fallback for PDFs that only expose two dates.
  if (!ranges.length && parsed.startDate && parsed.expirationDate) {
    ranges.push({ startDate: parsed.startDate, expirationDate: parsed.expirationDate });
  }

  return ranges;
}

export async function extractPdfText(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text?.trim() || "";
  } finally {
    await parser.destroy();
  }
}
