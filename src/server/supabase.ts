import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!client) {
    const url = process.env.SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_KEY?.trim();

    if (!(url && key)) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_KEY must be configured."
      );
    }

    client = createClient(url, key);
  }

  return client;
}
