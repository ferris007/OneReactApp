import React, { forwardRef } from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

// Forward the ref to the underlying TextInput
const Input = forwardRef<TextInput, TextInputProps>((props, ref) => {
  return (
    <TextInput
      ref={ref}
      style={[styles.input, {
        height: props.multiline ? 80 : 40,
      }]}
      onChangeText={props.onChangeText}
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
});

export { Input };
