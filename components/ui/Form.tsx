import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Controller, Control, FieldValues, Path, ControllerProps } from 'react-hook-form';

// Props for simple container components
type ContainerProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

// Props for simple text components
type TextProps = {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

const Form = ({ children, style }: ContainerProps) => <View style={style}>{children}</View>;

const FormItem = ({ children, style }: ContainerProps) => <View style={[styles.formItem, style]}>{children}</View>;

const FormLabel = ({ children, style }: TextProps) => <Text style={[styles.formLabel, style]}>{children}</Text>;

const FormControl = ({ children, style }: ContainerProps) => <View style={style}>{children}</View>;

const FormMessage = ({ children, style }: TextProps) => {
  // Only render if there are children (i.e., an error message)
  if (!children) {
    return null;
  }
  return <Text style={[styles.formMessage, style]}>{children}</Text>;
};

/**
 * A component that connects a form input to react-hook-form.
 * It's a lightweight wrapper around the Controller component.
 */
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>
>(
  props: ControllerProps<TFieldValues, TName>
) => {
  return <Controller<TFieldValues, TName> {...props} />;
};

const styles = StyleSheet.create({
  formItem: {
    marginBottom: 16,
  },
  formLabel: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  formMessage: {
    color: 'red',
    marginTop: 4,
  },
});

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
};
