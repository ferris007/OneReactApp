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
import ClientAnalytics from "../../components/admin/ClientAnalytics";

export default function AdminAnalytics() {
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: measurements } = useQuery<Measurement[]>({
    queryKey: ["/api/admin/recent-measurements"],
  });

  const { data: goals } = useQuery<Goal[]>({
    queryKey: ["/api/admin/goals"],
  });

  if (!users || !measurements || !goals) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const totalClients = users.filter(u => u.role === 'client').length;
  const totalMeasurements = measurements.length;
  const totalGoals = goals.length;
  const activeGoals = goals.filter((g: any) => g.status === 'in_progress').length;
  const completedGoals = goals.filter((g: any) => g.status === 'completed').length;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toDateString();
  }).reverse();

  const registrationTrend = last7Days.map(dateStr => {
    const usersOnDate = users.filter(user => {
      return new Date(user.createdAt || Date.now()).toDateString() === dateStr;
    }).length;
    
    return {
      date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      users: usersOnDate
    };
  });

  const goalStatusData = [
    { name: 'In Progress', value: activeGoals, color: '#3b82f6' },
    { name: 'Completed', value: completedGoals, color: '#10b981' },
    { name: 'Cancelled', value: goals.filter((g: any) => g.status === 'cancelled').length, color: '#ef4444' }
  ];

  const weightLossData = measurements
    .filter(curr => curr.date)
    .reduce((acc: any[], curr) => {
      if (!curr.date) return acc;
      const month = new Date(curr.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      const existing = acc.find((item) => item.month === month);
      if (existing) {
        existing.totalWeight += curr.weight || 0;
        existing.count += 1;
      } else {
        acc.push({
          month,
          totalWeight: curr.weight || 0,
          count: 1,
        });
      }
      return acc;
    }, [])
    .map((item) => ({
      month: item.month,
      averageWeight: item.totalWeight / item.count,
    }));

  const goalCompletionData = goals.map((goal) => {
    const isCompleted = goal.status === 'completed';
    return {
      month: goal.month,
      completionRate: isCompleted ? 100 : (goal.status === 'in_progress' ? 50 : 0),
    };
  });

  const averageBodyComposition = measurements.reduce(
    (acc, curr) => {
      if (typeof curr.bodyFat === 'number') {
        acc.bodyFat.push(curr.bodyFat);
      }
      if (typeof curr.muscleMass === 'number') {
        acc.muscleMass.push(curr.muscleMass);
      }
      return acc;
    },
    { bodyFat: [] as number[], muscleMass: [] as number[] }
  );

  return (
    <SafeAreaView style={styles.container}>
      <Sidebar />
      <ScrollView style={styles.mainContent}>
        <Text style={styles.title}>Analytics</Text>

        <View style={styles.gridContainer}>
          <Card style={styles.card}>
            <CardHeader>
              <CardTitle>Average Weight Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.chartPlaceholder}>
                <Text>Line Chart Placeholder</Text>
              </View>
            </CardContent>
          </Card>

          <Card style={styles.card}>
            <CardHeader>
              <CardTitle>Goal Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.chartPlaceholder}>
                <Text>Bar Chart Placeholder</Text>
              </View>
            </CardContent>
          </Card>
        </View>

        <Card style={styles.fullWidthCard}>
          <CardHeader>
            <CardTitle>Client Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Clients</Text>
                <Text style={styles.statValue}>{totalClients}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Average Body Fat %</Text>
                <Text style={styles.statValue}>
                  {averageBodyComposition.bodyFat.length > 0
                    ? (
                        averageBodyComposition.bodyFat.reduce(
                          (a, b) => a + b,
                          0
                        ) / averageBodyComposition.bodyFat.length
                      ).toFixed(1)
                    : "N/A"}
                  {averageBodyComposition.bodyFat.length > 0 ? "%" : ""}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Average Muscle Mass</Text>
                <Text style={styles.statValue}>
                  {averageBodyComposition.muscleMass.length > 0
                    ? (
                        averageBodyComposition.muscleMass.reduce(
                          (a, b) => a + b,
                          0
                        ) / averageBodyComposition.muscleMass.length
                      ).toFixed(1)
                    : "N/A"}
                  {averageBodyComposition.muscleMass.length > 0 ? " lbs" : ""}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
        
        <ClientAnalytics />
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
    width: "48%", // Adjust as needed for spacing
    marginBottom: 16,
  },
  fullWidthCard: {
    width: "100%",
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "30%",
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 12,
    color: "gray",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
