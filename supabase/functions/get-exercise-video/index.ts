// get-exercise-video — mints a short-lived signed R2 URL for a paid user.
//
// Security model:
//   1. Requires a valid Supabase JWT (the caller must be logged in).
//   2. Checks profiles.is_paid = true (RevenueCat entitlement, server-verified).
//   3. Only then returns a 120s presigned R2 GET URL.
// No entitlement -> 403, no URL ever leaves the server.
//
// Deploy:  supabase functions deploy get-exercise-video
// Secrets: supabase secrets set R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... \
//            R2_SECRET_ACCESS_KEY=... R2_BUCKET=momentum-exercise-media
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

const R2_ACCOUNT_ID = Deno.env.get("R2_ACCOUNT_ID")!;
const R2_BUCKET = Deno.env.get("R2_BUCKET")!;
const r2 = new AwsClient({
  accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
  secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
  region: "auto",
  service: "s3",
});

const TTL_SECONDS = 120;
// db_id is kebab-case slugs only — reject anything else to prevent key traversal.
const ID_RE = /^[a-z0-9-]{1,64}$/;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json(401, { error: "missing token" });

    // Client scoped to the caller's JWT — RLS applies.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return json(401, { error: "invalid token" });

    // Entitlement check — is_paid is webhook-controlled, clients can't set it.
    const { data: profile, error: pErr } = await supabase
      .from("profiles").select("is_paid").eq("id", user.id).single();
    if (pErr) return json(500, { error: "profile lookup failed" });
    if (!profile?.is_paid) return json(403, { error: "subscription required" });

    const { exerciseId } = await req.json().catch(() => ({}));
    if (!exerciseId || !ID_RE.test(exerciseId)) return json(400, { error: "bad exerciseId" });

    const key = `videos/${exerciseId}.mp4`;
    const url =
      `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${key}` +
      `?X-Amz-Expires=${TTL_SECONDS}`;
    const signed = await r2.sign(new Request(url, { method: "GET" }), {
      aws: { signQuery: true },
    });

    return json(200, { url: signed.url, expiresIn: TTL_SECONDS });
  } catch (e) {
    return json(500, { error: String(e) });
  }
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
