import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Sidebar } from "../../components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { useQuery } from "@tanstack/react-query";
import { User, Measurement, Goal } from "../../shared/schema";
import { Feather } from "@expo/vector-icons";

export default function AdminDashboard() {
  const { data: users, isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: recentMeasurements, isLoading: loadingMeasurements } = useQuery<Measurement[]>({
    queryKey: ["/api/admin/recent-measurements"],
  });

  const { data: goals, isLoading: loadingGoals } = useQuery<Goal[]>({
    queryKey: ["/api/admin/goals"],
  });

  if (loadingUsers || loadingMeasurements || loadingGoals) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Sidebar />
      <ScrollView style={styles.mainContent}>
        <Text style={styles.title}>Admin Dashboard</Text>

        <View style={styles.gridContainer}>
          <Card style={styles.card}>
            <CardHeader style={styles.cardHeader}>
              <CardTitle style={styles.cardTitle}>Total Clients</CardTitle>
              <Feather name="users" size={16} color="gray" />
            </CardHeader>
            <CardContent>
              <Text style={styles.cardValue}>{users?.length || 0}</Text>
            </CardContent>
          </Card>

          <Card style={styles.card}>
            <CardHeader style={styles.cardHeader}>
              <CardTitle style={styles.cardTitle}>Active Goals</CardTitle>
              <Feather name="target" size={16} color="gray" />
            </CardHeader>
            <CardContent>
              <Text style={styles.cardValue}>{goals?.length || 0}</Text>
            </CardContent>
          </Card>

          <Card style={styles.card}>
            <CardHeader style={styles.cardHeader}>
              <CardTitle style={styles.cardTitle}>Progress Updates</CardTitle>
              <Feather name="trending-up" size={16} color="gray" />
            </CardHeader>
            <CardContent>
              <Text style={styles.cardValue}>{recentMeasurements?.length || 0}</Text>
            </CardContent>
          </Card>
        </View>

        <View style={styles.gridContainer}>
          <Card style={styles.fullWidthCard}>
            <CardHeader>
              <CardTitle>Recent Client Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.listContainer}>
                {recentMeasurements?.map((measurement) => {
                  const user = users?.find((u) => u.id === measurement.userId);
                  return (
                    <View key={measurement.id} style={styles.listItem}>
                      <View>
                        <Text style={styles.listItemTitle}>
                          {user?.name || user?.username}
                        </Text>
                        <Text style={styles.listItemSubtitle}>
                          Updated measurements on {measurement.date ? new Date(measurement.date).toLocaleDateString() : 'an unknown date'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </CardContent>
          </Card>

          <Card style={styles.fullWidthCard}>
            <CardHeader>
              <CardTitle>Active Goals Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.listContainer}>
                {goals?.map((goal) => {
                  const user = users?.find((u) => u.id === goal.userId);
                  const achievedCount = Object.values(goal.achieved || {}).filter(Boolean).length;
                  return (
                    <View key={goal.id} style={styles.listItem}>
                      <View>
                        <Text style={styles.listItemTitle}>
                          {user?.name || user?.username}
                        </Text>
                        <Text style={styles.listItemSubtitle}>
                          {goal.month}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.listItemProgress}>
                          {achievedCount} / 3 goals achieved
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
  },
  mainContent: {
    flex: 1,
    padding: 16,
    marginLeft: 64, // Adjust based on sidebar width
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    width: "32%", // Approx 1/3rd for 3 columns
    marginBottom: 16,
  },
  fullWidthCard: {
    width: "100%",
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  listContainer: {
    marginTop: 10,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingVertical: 10,
  },
  listItemTitle: {
    fontWeight: "bold",
  },
  listItemSubtitle: {
    fontSize: 12,
    color: "gray",
  },
  listItemProgress: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
