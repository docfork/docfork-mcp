"use client";

import Image from "next/image";

export function Logo() {
  return (
    <>
      <Image
        src="/logo_black.svg"
        alt="Docfork"
        width={547}
        height={118}
        className="h-7 w-auto dark:hidden"
        priority
      />
      <Image
        src="/logo_white.svg"
        alt="Docfork"
        width={547}
        height={118}
        className="h-7 w-auto hidden dark:block"
        priority
      />
    </>
  );
}
