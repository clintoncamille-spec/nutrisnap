// Documented alternate VisionProvider implementation — NOT built yet.
// Swapping to Gemini would require:
//  1. `npm install @google/genai`, model e.g. "gemini-2.0-flash".
//  2. Fetching image bytes server-side from the Supabase signed URL (Gemini
//     wants inline base64 or a File API upload, not an arbitrary public
//     URL like OpenAI accepts) and either inlining or uploading via the
//     File API.
//  3. Using `responseMimeType: "application/json"` + `responseSchema`
//     (Gemini's own JSON-schema dialect, a subset of OpenAPI schema) in
//     place of OpenAI's `response_format: json_schema` — the zod schemas
//     in ./schemas.ts would need a small adapter to that dialect, not a
//     rewrite of the domain types or prompts.
// Everything else — domain types, prompt content, retry/validation logic,
// routes, repositories — stays identical. Select via VISION_PROVIDER=gemini
// once implemented; see ./index.ts for the factory seam.

export {};
