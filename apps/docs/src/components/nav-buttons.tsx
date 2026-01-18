"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { buttonVariants } from "fumadocs-ui/components/ui/button";

export function NavButtons() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="mailto:support@docfork.com"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({
            color: "secondary",
          }),
          "px-3.5 py-1.5 text-nowrap"
        )}
      >
        Support
      </Link>
      <Link
        href={process.env.NEXT_PUBLIC_APP_URL! + "/sign-up"}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({
            color: "primary",
          }),
          "px-3.5 py-1.5 bg-docfork text-nowrap"
        )}
      >
        Sign Up
      </Link>
    </div>
  );
}
