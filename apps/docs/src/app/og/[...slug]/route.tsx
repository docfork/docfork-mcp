import { getPageImage, source } from "@/lib/source";
import { notFound } from "next/navigation";
import { ImageResponse } from "@takumi-rs/image-response";
import type { PersistentImage } from "@takumi-rs/core";
import DocforkOG from "@/components/og-image";
import { readFile } from "fs/promises";
import { join } from "path";

export const revalidate = false;

// load logo at module level for persistent images
let persistentImages: PersistentImage[] | null = null;

async function getPersistentImages(): Promise<PersistentImage[]> {
  if (persistentImages) return persistentImages;

  // load icon.png as persistent image
  const logoPath = join(process.cwd(), "public", "icon.png");
  const logoBuffer = await readFile(logoPath);

  persistentImages = [
    {
      src: "docfork-logo",
      data: logoBuffer,
    },
  ];

  return persistentImages;
}

export async function GET(_req: Request, { params }: RouteContext<"/og/[...slug]">) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const images = await getPersistentImages();

  return new ImageResponse(
    <DocforkOG
      title={page.data.title}
      description={page.data.description}
      logoUrl="docfork-logo"
    />,
    {
      width: 1200,
      height: 630,
      format: "webp",
      persistentImages: images,
    }
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImage(page).segments,
  }));
}
