import { getLLMText, source } from "@/lib/source";
import { notFound } from "next/navigation";

export const revalidate = false;

export async function GET(
  req: Request,
  { params }: RouteContext<"/llms.md/[[...slug]]">
) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  // get full base url from request
  const url = new URL(req.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  return new Response(await getLLMText(page, baseUrl), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}
