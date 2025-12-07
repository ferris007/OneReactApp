import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface DialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DialogContentProps {
  children: React.ReactNode;
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

interface DialogTitleProps {
  children: React.ReactNode;
}

export function Dialog({ children, open, onOpenChange }: DialogProps) {
  return (
    <Modal
      visible={open}
      onRequestClose={() => onOpenChange(false)}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function DialogTrigger({ children, asChild }: DialogTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onPress: () => { /* handle open */ } });
  }
  return (
    <TouchableOpacity onPress={() => { /* handle open */ }}>
      {children}
    </TouchableOpacity>
  );
}

export function DialogContent({ children }: DialogContentProps) {
  return <View style={styles.dialogContent}>{children}</View>;
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <View style={styles.dialogHeader}>{children}</View>;
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <Text style={styles.dialogTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  dialogContent: {
    // Add specific styles for dialog content if needed
  },
  dialogHeader: {
    marginBottom: 15,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
