import { describe, expect, it } from "vitest";

import { detectDatesFromText, detectMonthlyDateRangesFromText } from "@/utils/pdf";

describe("pdf date detection", () => {
  it("extracts likely start and expiration dates", () => {
    const text = "Prescription start 01/04/2026 valid until 30/04/2026";
    const result = detectDatesFromText(text);

    expect(result.startDate?.getFullYear()).toBe(2026);
    expect(result.startDate?.getMonth()).toBe(3);
    expect(result.startDate?.getDate()).toBe(1);

    expect(result.expirationDate?.getFullYear()).toBe(2026);
    expect(result.expirationDate?.getMonth()).toBe(3);
    expect(result.expirationDate?.getDate()).toBe(30);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it("extracts dates from Hebrew delivery approval cue", () => {
    const text = "אישור המסירה בתוקף מ- 03/04/2026 עד 03/05/2026";
    const result = detectDatesFromText(text);
    const ranges = detectMonthlyDateRangesFromText(text);

    expect(result.startDate?.getFullYear()).toBe(2026);
    expect(result.startDate?.getMonth()).toBe(3);
    expect(result.startDate?.getDate()).toBe(3);
    expect(result.expirationDate?.getFullYear()).toBe(2026);
    expect(result.expirationDate?.getMonth()).toBe(4);
    expect(result.expirationDate?.getDate()).toBe(3);
    expect(ranges).toHaveLength(1);
    expect(ranges[0].startDate.getFullYear()).toBe(2026);
    expect(ranges[0].startDate.getMonth()).toBe(3);
    expect(ranges[0].startDate.getDate()).toBe(3);
    expect(ranges[0].expirationDate.getFullYear()).toBe(2026);
    expect(ranges[0].expirationDate.getMonth()).toBe(4);
    expect(ranges[0].expirationDate.getDate()).toBe(3);
  });
});
