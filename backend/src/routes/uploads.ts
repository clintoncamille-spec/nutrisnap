import type { FastifyInstance } from "fastify";
import { ALLOWED_MIME_TYPES } from "../lib/imageLimits.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { imageStorage } from "../services/storage/supabaseStorage.js";
import { z } from "zod";

const deleteBodySchema = z.object({ photoPath: z.string().min(1) });

export async function uploadRoutes(app: FastifyInstance) {
  app.delete(
    "/api/uploads",
    { onRequest: requireAuth },
    async (request, reply) => {
      const parsed = deleteBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply
          .code(400)
          .send({ error: "invalid_request", message: "photoPath is required" });
      }

      if (!imageStorage.isOwnedByUser(request.userId, parsed.data.photoPath)) {
        return reply.code(403).send({ error: "forbidden" });
      }

      await imageStorage.remove(parsed.data.photoPath);
      return reply.code(204).send();
    },
  );

  app.post(
    "/api/uploads",
    { onRequest: requireAuth },
    async (request, reply) => {
      const file = await request.file();
      if (!file) {
        return reply
          .code(400)
          .send({ error: "invalid_image", message: "No file provided" });
      }

      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        return reply.code(400).send({
          error: "invalid_image",
          message: `Unsupported file type: ${file.mimetype}`,
        });
      }

      const buffer = await file.toBuffer();
      if (file.file.truncated) {
        return reply.code(413).send({
          error: "invalid_image",
          message: "File exceeds the maximum upload size",
        });
      }

      const result = await imageStorage.upload(
        request.userId,
        buffer,
        file.mimetype,
        file.filename,
      );

      return reply.send({ photoPath: result.path, signedUrl: result.signedUrl });
    },
  );
}
