import { loadEnv } from "@/lib/env";

describe("env loader", () => {
  const origEnv = process.env;

  afterEach(() => {
    process.env = origEnv;
  });

  it("returns url and anon key when both present", () => {
    process.env = {
      ...origEnv,
      EXPO_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
      EXPO_PUBLIC_SUPABASE_ANON_KEY: "anon-test-key",
    };
    expect(loadEnv()).toEqual({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon-test-key",
    });
  });

  it("throws with clear message when URL missing", () => {
    process.env = {
      ...origEnv,
      EXPO_PUBLIC_SUPABASE_URL: undefined,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: "anon-test-key",
    };
    expect(() => loadEnv()).toThrow(/EXPO_PUBLIC_SUPABASE_URL/);
  });

  it("throws with clear message when ANON KEY missing", () => {
    process.env = {
      ...origEnv,
      EXPO_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
      EXPO_PUBLIC_SUPABASE_ANON_KEY: undefined,
    };
    expect(() => loadEnv()).toThrow(/EXPO_PUBLIC_SUPABASE_ANON_KEY/);
  });
});
