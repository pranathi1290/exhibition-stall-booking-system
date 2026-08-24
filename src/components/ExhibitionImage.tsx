"use client";

import { useState } from "react";

const fallbackImage =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
};

export default function ExhibitionImage({ src, alt, className }: Props) {
  const [imageSrc, setImageSrc] = useState(src || fallbackImage);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imageSrc !== fallbackImage) setImageSrc(fallbackImage);
      }}
    />
  );
}
