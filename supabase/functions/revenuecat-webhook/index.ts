// RevenueCat → Supabase entitlement webhook.
//
// Deploy:  supabase functions deploy revenuecat-webhook --no-verify-jwt
// Secrets: supabase secrets set RC_WEBHOOK_AUTH=<shared secret> \
//                               SB_SECRET_KEY=<sb_secret_... key>
// (Supabase reserves the SUPABASE_ prefix for user-set secrets, hence SB_.)
// SUPABASE_URL is auto-injected by the edge runtime.
// In the RevenueCat dashboard set the webhook URL to this function and the
// Authorization header to the same RC_WEBHOOK_AUTH value.
//
// This is the ONLY writer of profiles.is_paid (the DB trigger blocks clients).
// RevenueCat maps app_user_id to our Supabase auth user id (set via logIn).

import { createClient } from "jsr:@supabase/supabase-js@2";

// entitlement types that mean the user currently has premium
const ACTIVE = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "SUBSCRIPTION_EXTENDED",
  "NON_RENEWING_PURCHASE",
]);
// types that revoke it
const INACTIVE = new Set(["CANCELLATION", "EXPIRATION", "BILLING_ISSUE"]);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const expected = Deno.env.get("RC_WEBHOOK_AUTH");
  if (!expected || req.headers.get("Authorization") !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }

  let event: { type?: string; app_user_id?: string };
  try {
    const body = await req.json();
    event = body?.event ?? {};
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const userId = event.app_user_id;
  const type = event.type ?? "";
  if (!userId) return new Response("No app_user_id", { status: 400 });

  // ignore anonymous RC ids that never bound to a Supabase user
  if (userId.startsWith("$RCAnonymousID:")) {
    return new Response("Anonymous id ignored", { status: 200 });
  }

  let isPaid: boolean;
  if (ACTIVE.has(type)) isPaid = true;
  else if (INACTIVE.has(type)) isPaid = false;
  else return new Response("Ignored event type", { status: 200 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SB_SECRET_KEY") ?? "",
  );
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      is_paid: isPaid,
      updated_at: new Date().toISOString(),
    });
  if (error) {
    return new Response(`DB error: ${error.message}`, { status: 500 });
  }
  return new Response("ok", { status: 200 });
});
