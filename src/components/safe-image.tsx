'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface SafeImageProps extends ImageProps {
  fallbackSrc?: string;
}

/**
 * Component hiển thị hình ảnh an toàn.
 * Nếu hình ảnh chính bị lỗi, nó sẽ tự động chuyển sang hình ảnh mặc định.
 */
const SafeImage = ({ src, fallbackSrc, alt, ...props }: SafeImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  // Đồng bộ hóa imgSrc khi prop src thay đổi ngay trong quá trình render (pattern khuyến nghị của React)
  if (src !== prevSrc) {
    setPrevSrc(src);
    setImgSrc(src);
    setHasError(false);
  }
  
  // Ảnh mặc định cao cấp cho sản phẩm điện lạnh
  const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1581092921461-7d6570975896?auto=format&fit=crop&q=80&w=800';

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      className={`${props.className || ''} transition-opacity duration-300 ${hasError ? 'opacity-90' : 'opacity-100'}`}
      onError={() => {
        if (!hasError) {
          setImgSrc(fallbackSrc || DEFAULT_PLACEHOLDER);
          setHasError(true);
        }
      }}
    />
  );
};

export default SafeImage;
