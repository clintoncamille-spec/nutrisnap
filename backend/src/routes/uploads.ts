import type { FastifyInstance } from "fastify";
import { ALLOWED_MIME_TYPES } from "../lib/imageLimits.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { imageStorage } from "../services/storage/supabaseStorage.js";

export async function uploadRoutes(app: FastifyInstance) {
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
