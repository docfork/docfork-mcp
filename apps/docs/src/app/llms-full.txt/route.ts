import { getLLMText, source } from "@/lib/source";

export const revalidate = false;

export async function GET(request: Request) {
  // get full base url from request
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const scan = source.getPages().map((page) => getLLMText(page, baseUrl));
  const scanned = await Promise.all(scan);

  return new Response(scanned.join("\n\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
