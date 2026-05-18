export type Env = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

function isMissing(value: string | undefined): boolean {
  return !value || value === "undefined" || value.trim() === "";
}

export function loadEnv(): Env {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (isMissing(supabaseUrl)) {
    throw new Error(
      "Missing EXPO_PUBLIC_SUPABASE_URL. Copy app/.env.example to app/.env and fill in values."
    );
  }
  if (isMissing(supabaseAnonKey)) {
    throw new Error(
      "Missing EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy app/.env.example to app/.env and fill in values."
    );
  }

  return { supabaseUrl: supabaseUrl!, supabaseAnonKey: supabaseAnonKey! };
}
