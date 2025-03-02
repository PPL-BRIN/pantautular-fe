import Image from 'next/image';
import React from 'react';

interface ImageHelpProps {
  src: string;
  alt: string;
}

const ImageHelp: React.FC<ImageHelpProps> = ({ src, alt }) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={200}
      className="w-full h-[200px] object-cover rounded-lg"
    />
  );
};

export default ImageHelp;