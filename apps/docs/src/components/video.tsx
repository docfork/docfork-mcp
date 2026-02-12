import React from "react";

interface VideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  title?: string;
  autoplay?: boolean;
}

export function Video({ src, title, autoplay, ...props }: VideoProps) {
  return (
    <video
      controls
      className="w-full rounded-lg border"
      autoPlay={autoplay}
      muted={autoplay}
      loop={autoplay}
      {...props}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
