// Creates (or re-provisions) a local test user with the admin role, for
// exercising the requireAdmin-gated routes during development.
//
// There is no fixed/default password here on purpose: a hardcoded
// credential (e.g. "admin"/"admin") against a real Supabase Auth project
// is a real backdoor, not a fixture. This script always generates a fresh
// random password and prints it once, to your terminal only.
//
// Usage (from backend/):
//   npx tsx scripts/create-test-user.ts [email]
//
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for your dev/test
// Supabase project — set them in backend/.env (tsx loads it
// automatically) or export them in your shell first. Point this at a
// dev/test project, never at production.
//
// Re-running rotates the password for the same email and prints the new
// one; it does not create a second account.

import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Fill these into backend/.env (copy backend/.env.example) pointing at " +
      "your dev/test Supabase project, then re-run this script.",
  );
  process.exit(1);
}

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to run with NODE_ENV=production.");
  process.exit(1);
}

const email = process.argv[2] ?? "test-admin@nutrisnap.local";
const password = randomBytes(18).toString("base64url"); // 24-char random password

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  // auth.admin.createUser fails if the email already exists, so look it
  // up first and reuse the same account, rotating its password so the
  // credential we print is always the one that currently works.
  const { data: existingPage, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;
  const existing = existingPage.users.find((u) => u.email === email);

  let userId: string;
  if (existing) {
    userId = existing.id;
    const { error } = await supabase.auth.admin.updateUserById(userId, { password });
    if (error) throw error;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error("createUser returned no user");
    userId = data.user.id;
  }

  // Ensure the profile row exists and is promoted to admin. Columns other
  // than id/role fall back to their DB defaults on first insert.
  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert({ id: userId, role: "admin" }, { onConflict: "id" });
  if (upsertError) throw upsertError;

  console.log(existing ? "Test admin user updated." : "Test admin user created.");
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
  console.log(`  user id:  ${userId}`);
  console.log(
    "\nThis password is freshly generated and only printed here — save it now " +
      "(a password manager, not a file in this repo). Re-run this script to rotate it.",
  );
}

main().catch((err) => {
  console.error("Failed to create test admin user:", err);
  process.exit(1);
});
