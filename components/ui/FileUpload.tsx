import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { validateFile } from '../../lib/upload-helpers';

type FileUploadProps = {
  onFileSelect: (file: DocumentPicker.DocumentPickerAsset) => void;
  accept: string;
  label: string;
  allowedTypes?: string[];
  maxSize?: number;
};

const extensionToMime: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
};

const FileUpload = ({ onFileSelect, accept, label, allowedTypes, maxSize }: FileUploadProps) => {
  const pickDocument = async () => {
    const mimeTypes = allowedTypes
      ? allowedTypes.map(ext => extensionToMime[ext] || '*/*')
      : ['*/*'];
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: mimeTypes,
        copyToCacheDirectory: false,
      });

      if (result.canceled === false) {
        const file = result.assets[0];
        if (allowedTypes && maxSize) {
          const { valid, error } = validateFile(file, allowedTypes, maxSize);

          if (!valid) {
            alert(error || "Invalid file.");
            return;
          }
        }
        onFileSelect(file);
      }
    } catch (err) {
      console.warn('Document picking cancelled or error', err);
    }
  };

  return (
    <TouchableOpacity onPress={pickDocument} style={styles.button}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export { FileUpload };
