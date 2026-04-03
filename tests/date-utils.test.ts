import { describe, expect, it } from "vitest";

import {
  autoStatusUpdate,
  daysUntilExpiration,
  formatDateInIsrael,
  isExpiringSoon,
  isExpired,
  matchesThreshold,
  parseIsraelDateInput,
} from "@/utils/date";

describe("date helpers", () => {
  it("calculates days until expiration", () => {
    const now = new Date("2026-04-03");
    const exp = new Date("2026-04-10");

    expect(daysUntilExpiration(exp, now)).toBe(7);
  });

  it("detects expiring soon", () => {
    const now = new Date("2026-04-03");
    const exp = new Date("2026-04-07");

    expect(isExpiringSoon(exp, 30, now)).toBe(true);
  });

  it("detects expired", () => {
    const now = new Date("2026-04-03");
    const exp = new Date("2026-04-01");

    expect(isExpired(exp, now)).toBe(true);
  });

  it("updates status according to business rules", () => {
    const now = new Date("2026-04-03");
    const exp = new Date("2026-04-01");

    expect(
      autoStatusUpdate({
        expirationDate: exp,
        currentStatus: "active",
        issuedAt: null,
        now,
      }),
    ).toBe("expired");

    expect(
      autoStatusUpdate({
        expirationDate: exp,
        currentStatus: "active",
        issuedAt: new Date("2026-04-02"),
        now,
      }),
    ).toBe("issued");
  });

  it("matches threshold day", () => {
    const now = new Date("2026-04-03");
    const exp = new Date("2026-04-10");

    expect(matchesThreshold(exp, 7, now)).toBe(true);
    expect(matchesThreshold(exp, 14, now)).toBe(false);
  });

  it("formats date in Israel timezone without one-day shift", () => {
    const date = new Date(Date.UTC(2026, 3, 3, 12, 0, 0));

    expect(formatDateInIsrael(date)).toBe("2026-04-03");
  });

  it("parses Israel date input using stable UTC noon", () => {
    const parsed = parseIsraelDateInput("2026-04-03");

    expect(parsed.getUTCFullYear()).toBe(2026);
    expect(parsed.getUTCMonth()).toBe(3);
    expect(parsed.getUTCDate()).toBe(3);
    expect(parsed.getUTCHours()).toBe(12);
  });
});
