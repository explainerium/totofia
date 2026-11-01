import { storage } from "@/server/integrations/storage";

// Serves files written by the local storage driver (development). In production media comes from R2.
export async function GET(_req: Request, { params }: RouteContext<"/media/[...key]">) {
  const { key } = await params;
  const body = await storage.get(key.join("/")).catch(() => null);
  if (!body) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
