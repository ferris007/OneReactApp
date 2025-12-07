import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Feather } from "@expo/vector-icons";

export default function NotFound() {
  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.card}>
        <CardContent style={styles.cardContent}>
          <View style={styles.header}>
            <Feather name="alert-circle" size={32} color="red" />
            <Text style={styles.title}>404 Page Not Found</Text>
          </View>
          <Text style={styles.description}>
            Did you forget to add the page to the router?
          </Text>
        </CardContent>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  card: {
    width: "90%",
    maxWidth: 400,
  },
  cardContent: {
    paddingTop: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  description: {
    marginTop: 16,
    fontSize: 14,
    color: "#4B5563",
  },
});
