import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import RNPickerSelect, { PickerSelectProps } from 'react-native-picker-select';

const Select = React.forwardRef<RNPickerSelect, PickerSelectProps & { hideIcon?: boolean }>(
  (props, ref) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 20 }}>
        <RNPickerSelect
          ref={ref}
          style={{
            ...pickerSelectStyles,
          }}
          useNativeAndroidPickerStyle={false}
          Icon={
            props.hideIcon
              ? undefined
              : () => (
                <View style={{ width: 20, height: 20, left: 25 }}>
                  <Ionicons
                    style={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}
                    name="chevron-down"
                    size={20}
                    color="gray"
                  />
                </View>
              )
          }
          {...props}
        />
      </View>
    );
  }
);

export const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingRight: 10,
    borderColor: '#ccc',
    color: 'black',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    color: 'black',
    paddingRight: 30,
    marginBottom: 16,
    width: '100%',
  },
});

export { Select };
