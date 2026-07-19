import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { binAmount, binCostRate, trackEvent } from "../analytics";

describe("Analytics Utility", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("binAmount", () => {
    test("correctly groups values into bands", () => {
      expect(binAmount(5000)).toBe("under_10k");
      expect(binAmount(10000)).toBe("10k_50k");
      expect(binAmount(50000)).toBe("50k_200k");
      expect(binAmount(75000)).toBe("50k_200k");
      expect(binAmount(200000)).toBe("200k_1m");
      expect(binAmount(500000)).toBe("200k_1m");
      expect(binAmount(1000000)).toBe("over_1m");
      expect(binAmount(1500000)).toBe("over_1m");
      expect(binAmount(undefined)).toBeNull();
    });
  });

  describe("binCostRate", () => {
    test("correctly groups rates into bands", () => {
      expect(binCostRate(6.5)).toBe("low");
      expect(binCostRate(7.0)).toBe("medium");
      expect(binCostRate(10.0)).toBe("medium");
      expect(binCostRate(11.5)).toBe("high");
      expect(binCostRate(14.0)).toBe("high");
      expect(binCostRate(14.5)).toBe("very_high");
      expect(binCostRate(undefined)).toBeNull();
    });
  });

  describe("getRotatingSessionId", () => {
    test("generates and preserves session id, then rotates it after 2 hours", () => {
      // Mock window and localStorage
      const storage: Record<string, string> = {};
      const mockLocalStorage = {
        getItem: (key: string) => storage[key] || null,
        setItem: (key: string, value: string) => { storage[key] = value; },
        clear: () => { for (const key in storage) delete storage[key]; }
      };
      
      vi.stubGlobal("localStorage", mockLocalStorage);

      // Force trackEvent to trigger session creation
      // We spy on fetch
      const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(() => 
        Promise.resolve(new Response(JSON.stringify({ accepted: true })))
      );

      trackEvent("loan_checker", { amount: 20000 });

      const firstSessionId = storage["rotating_session_id"];
      expect(firstSessionId).toBeDefined();
      expect(firstSessionId.length).toBeGreaterThan(5);

      // Repeated tracking call within 2 hours should use same session ID
      vi.advanceTimersByTime(1 * 60 * 60 * 1000); // 1 hour
      trackEvent("product_compare");
      expect(storage["rotating_session_id"]).toBe(firstSessionId);

      // Advancing past 2 hours should rotate session ID
      vi.advanceTimersByTime(1.5 * 60 * 60 * 1000); // Another 1.5 hours (total 2.5 hours)
      trackEvent("locator");
      const secondSessionId = storage["rotating_session_id"];
      expect(secondSessionId).not.toBe(firstSessionId);
    });
  });
});
