import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { Sidebar } from "../components/layout/Sidebar";
import { RewardDashboard } from "../components/viift/RewardDashboard";
import { useAuth } from "../app/context/useAuth";
import { useGetTrustedDevices, useGetWeightClaims } from "../app/api-calls/Rewards/rewards";

export default function Rewards() {
  const { user } = useAuth();

 


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 5, android: 0 }) ?? 0}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.mainContent}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
            <Sidebar />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.title}>VII Rewards</Text>
              <Text style={styles.subtitle}>
                Earn VII tokens by achieving your fitness goals and claim them on the XRP Ledger
              </Text>
            </View>
          </View>












          <RewardDashboard userId={user?.id?.toString()} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
    maxWidth: "90%"
  },
});
