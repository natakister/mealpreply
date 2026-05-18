import { initI18n, t, getCurrentLocale, setLocale } from "@/i18n";

describe("i18n", () => {
  beforeAll(async () => {
    await initI18n();
  });

  it("returns en string by default", () => {
    expect(t("smokeTest.title")).toBe("MealPreply v1 — Foundation OK");
  });

  it("returns the key itself for missing keys (no crash)", () => {
    expect(t("nonexistent.key" as any)).toBe("nonexistent.key");
  });

  it("exposes current locale", () => {
    expect(getCurrentLocale()).toBe("en");
  });

  it("setLocale to unsupported falls back to en", async () => {
    await setLocale("xx" as any);
    expect(getCurrentLocale()).toBe("en");
  });
});
