import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ClaimRewardsProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimed: () => void;
  pendingBalance: number;
}

export function ClaimRewards({ isOpen, onClose, onClaimed, pendingBalance }: ClaimRewardsProps) {
  return (
    <Modal
      visible={isOpen}
      onRequestClose={onClose}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Claim Rewards</Text>
          <Text style={styles.description}>
            You have {pendingBalance} VII tokens available to claim.
          </Text>
          <TouchableOpacity onPress={onClaimed} style={styles.button}>
            <Text style={styles.buttonText}>Claim Now</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
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
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
  },
  closeButtonText: {
    color: 'gray',
  },
});
