import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from '../ui/Input';

interface WalletConnectionProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (wallet: string) => void;
}

export function WalletConnection({ isOpen, onClose, onConnected }: WalletConnectionProps) {
  const [walletAddress, setWalletAddress] = useState<string>("")

  return (
    <Modal
      visible={isOpen}
      onRequestClose={onClose}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Change XRP Wallet</Text>
          <Input
            style={styles.textInput}
            value={walletAddress}
            onChangeText={(text) => setWalletAddress(text)}
            placeholder="Edit your wallet address"
          />
          <TouchableOpacity onPress={() => onConnected(walletAddress)} style={styles.button}>
            <Text style={styles.buttonText}>Change Wallet Address</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>


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
  textInput: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    width: '100%',
    marginTop: 16
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
