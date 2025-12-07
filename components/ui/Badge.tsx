import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';

type BadgeProps = {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children: React.ReactNode;
  style?: StyleProp<ViewStyle | TextStyle>;
};

const Badge = ({ variant = 'default', children, style }: BadgeProps) => {
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={[styles.textBase, styles[`${variant}Text`]]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  textBase: {
    fontSize: 12,
    fontWeight: '500',
  },
  default: {
    backgroundColor: '#E0E0E0',
  },
  defaultText: {
    color: '#333333',
  },
  secondary: {
    backgroundColor: '#F0F0F0',
  },
  secondaryText: {
    color: '#555555',
  },
  destructive: {
    backgroundColor: '#FFCCCC',
  },
  destructiveText: {
    color: '#CC0000',
  },
  outline: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  outlineText: {
    color: '#333333',
  },
});

export { Badge };
