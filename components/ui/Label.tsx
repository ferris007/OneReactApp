import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';

type LabelProps = {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

const Label = ({ children, style }: LabelProps) => {
  return <Text style={[styles.label, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
});

export { Label };
