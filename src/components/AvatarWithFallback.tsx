"use client";
import React, { useState } from "react";
import { getImageSrc } from '@/utils/getImageSrc';

interface Props {
  src?: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export default function AvatarWithFallback({ 
  src, 
  alt, 
  className, 
  fallback = 'https://blog-1257292087.cos.ap-nanjing.myqcloud.com/default-avatar.png' 
}: Props) {
  const [imgSrc, setImgSrc] = useState(src || fallback);

  return (
    <img
      src={getImageSrc(imgSrc)}
      alt={alt}
      className={className}
      onError={() => setImgSrc(fallback)}
    />
  );
} 