"use client";

import type { HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  external?: boolean;
  icon?: ReactNode;
  href?: string;
}

export function Card({
  title,
  description,
  external = false,
  icon,
  href,
  className,
  children,
  ...props
}: CardProps) {
  const isExternal = external === true;
  const isInternal = !!(href && !isExternal && href.startsWith("/"));
  const baseClassName = cn(
    "card block font-normal group relative my-1 rounded-2xl border border-fd-border overflow-hidden w-full cursor-pointer hover:border-fd-primary hover:bg-fd-accent/80 transition-colors",
    className
  );

  const content = (
    <div className="px-6 py-5 relative" data-component-part="card-content-container">
      {isExternal && (
        <div
          id="card-link-arrow-icon"
          className="absolute top-5 right-5 text-fd-muted-foreground group-hover:text-fd-primary transition-colors"
        >
          <ArrowUpRight className="w-4 h-4" />
        </div>
      )}

      {icon && (
        <div
          className="h-10 w-10 text-fd-foreground flex items-center justify-center"
          data-component-part="card-icon"
        >
          <span className="[&>svg]:w-10 [&>svg]:h-10 [&>svg]:stroke-[1.8]">{icon}</span>
        </div>
      )}

      <div className="w-full">
        <h3 className="not-prose font-semibold text-base mt-4">{title}</h3>
        {description ? (
          <div className="prose mt-1 font-normal text-base leading-6 text-fd-muted-foreground">
            <span>{description}</span>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );

  if (isInternal && href) {
    return (
      <Link {...props} href={href} data-card="true" className={baseClassName}>
        {content}
      </Link>
    );
  }

  if (!href) {
    return (
      <div {...props} data-card="true" className={baseClassName}>
        {content}
      </div>
    );
  }

  return (
    <a
      {...(props as HTMLAttributes<HTMLAnchorElement>)}
      {...(href ? { href } : {})}
      {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
      data-card="true"
      className={baseClassName}
    >
      {content}
    </a>
  );
}

// Custom Cards wrapper that forces full width
export function Cards({ children, className, ...props }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 w-full", className)} {...props}>
      {children}
    </div>
  );
}
