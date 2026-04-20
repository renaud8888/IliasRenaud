import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";

export function getSupabaseBrowserClient() {
  const env = getSupabaseEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}
