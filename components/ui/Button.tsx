import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

// Define the types for variant and size
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'ghost';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

// Define the props for the component
interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Explicitly type the variant and size style objects
const buttonVariants: Record<ButtonVariant, ViewStyle> = {
  default: {
    backgroundColor: '#007BFF',
  },
  destructive: {
    backgroundColor: '#DC3545',
  },
  outline: {
    borderWidth: 1,
    borderColor: '#007BFF',
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
};

const textVariants: Record<ButtonVariant, TextStyle> = {
  default: { color: '#FFFFFF' },
  destructive: { color: '#FFFFFF' },
  outline: { color: '#007BFF' },
  ghost: { color: '#007BFF' },
};

const buttonSizes: Record<ButtonSize, ViewStyle> = {
  default: { paddingHorizontal: 16, paddingVertical: 12 },
  sm: { paddingHorizontal: 12, paddingVertical: 8 },
  lg: { paddingHorizontal: 24, paddingVertical: 12 },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
};

const textSizes: Record<ButtonSize, TextStyle> = {
  default: { fontSize: 16 },
  sm: { fontSize: 14 },
  lg: { fontSize: 18 },
  icon: { fontSize: 16 },
};

const Button = ({
  variant = 'default',
  size = 'default',
  style,
  children,
  ...props
}: ButtonProps) => {
  const containerStyle = [styles.base, buttonVariants[variant], buttonSizes[size], style];
  const textStyle = [styles.textBase, textVariants[variant], textSizes[size]];

  return (
    <TouchableOpacity style={containerStyle} {...props}>
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  textBase: {
    fontWeight: '600',
  },
});

export { Button };