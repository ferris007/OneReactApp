import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

// Define the component's props by extending the standard TextInputProps
const Textarea = (props: TextInputProps) => {
  return (
    <TextInput
      style={styles.textarea}
      multiline
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  textarea: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
});

export { Textarea };