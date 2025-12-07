import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";

type TimePickerProps = {
  value: string; // "HH:00"
  onChange: (time: string) => void;
};

const TimePicker = ({ value, onChange }: TimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  return (
    <View>
      {/* Button to open modal */}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        style={styles.timePickerButton}
      >
        <Text>{value}</Text>
      </TouchableOpacity>

      {/* Modal with hours */}
      <Modal visible={isOpen} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Select Hour</Text>

            <FlatList
              data={hours}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.hourItem}
                  onPress={() => {
                    onChange(`${item}:00`);
                    setIsOpen(false);
                  }}
                >
                  <Text style={styles.hourText}>{item}:00</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsOpen(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  timePickerButton: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    borderRadius: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  hourItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  hourText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export { TimePicker };
