import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

export function getSupabaseBrowserClient() {
  const env = getEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}
