import React from 'react';
import { View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type StarRatingProps = {
  rating: number; // 0 to 5, supports .5
  size?: number;
  color?: string;
};

const StarRating = ({ rating, size = 20, color = '#FFD700' }: StarRatingProps) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FontAwesome key={i} name="star" size={size} color={color} />);
    } else if (rating + 0.5 >= i) {
      stars.push(<FontAwesome key={i} name="star-half-empty" size={size} color={color} />);
    } else {
      stars.push(<FontAwesome key={i} name="star-o" size={size} color={color} />);
    }
  }

  return <View style={{ flexDirection: 'row' }}>{stars}</View>;
};

export default StarRating;
