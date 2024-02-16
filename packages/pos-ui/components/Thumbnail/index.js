import React, { useEffect, useState } from 'react';
import Image from 'next/image';
const PLACEHOLDER_IMG = '/assets/images/default.svg';

export const Thumbnail = ({
  thumbnail,
  alt = 'Thumbnail',
  height = 60,
  width = 60,
  placeholder = 'blur',
}) => {
  /**
   * PlaceHolder if image not exists
   */
  const [src, setSrc] = useState(PLACEHOLDER_IMG);

  /**
   * Settings SRC after receiving it from the server
   */
  useEffect(() => {
    if (thumbnail) {
      setSrc(thumbnail);
    }
  }, [thumbnail]);

  return (
    <Image
      src={src}
      width={width}
      height={height}
      priority="true"
      placeholder={placeholder}
      blurDataURL={PLACEHOLDER_IMG}
      alt={alt}
      onError={() => setSrc(PLACEHOLDER_IMG)}
    />
  );
};
