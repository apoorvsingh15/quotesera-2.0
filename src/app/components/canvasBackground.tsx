import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

const url = 'https://konvajs.github.io/assets/yoda.jpg';

export const CanvasBackground = () => {
  const [image] = useImage(url);

  // "image" will be DOM image element or undefined

  return (
    <Image width={512} height={500} image={image} alt="background_image" />
  );
}