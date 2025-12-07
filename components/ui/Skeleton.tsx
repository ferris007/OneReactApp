import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

type SkeletonProps = {
  style?: StyleProp<ViewStyle>;
};

const Skeleton = ({ style }: SkeletonProps) => {
  return <View style={[styles.skeleton, style]} />;
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
});

export { Skeleton };
