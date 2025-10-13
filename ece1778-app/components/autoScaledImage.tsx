import React, { useEffect, useState } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { StyleSheet } from "react-native";

type AutoImageProps = {
  source: any; // {uri: string} or require(...)
  style?: StyleProp<ImageStyle>; // height or width is required to scale
};

const AutoImage = ({ source, style }: AutoImageProps) => {
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (typeof source === 'number') {
      // For local images (require)
      const { width, height } = Image.resolveAssetSource(source);
      setAspectRatio(width / height);
    } else if (source?.uri) {
      // For remote images
      Image.getSize(source.uri, (width, height) => {
        setAspectRatio(width / height);
      });
    }
  }, [source]);

  return (
    <Image
      source={source}
      style={[
        styles.thumbnail,
        aspectRatio ? { aspectRatio } : null,
        style,
      ]}
    />
  );
};

export default AutoImage;

const styles = StyleSheet.create({
  thumbnail: {
      resizeMode: 'contain',
      borderRadius: 3,
  },
});