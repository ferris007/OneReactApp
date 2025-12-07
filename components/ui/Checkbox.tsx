import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

const Checkbox = ({ checked, onCheckedChange }: CheckboxProps) => {
  return (
    <TouchableOpacity onPress={() => onCheckedChange(!checked)} style={[styles.checkboxBase, checked && styles.checkboxChecked]}>
      {checked && <Feather name="check" size={16} color="white" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxBase: {
    width: 24,
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007BFF',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#007BFF',
  },
});

export { Checkbox };
