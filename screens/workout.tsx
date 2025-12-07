import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { Sidebar } from "../components/layout/Sidebar";
import { useAuth } from "../app/context/useAuth";
import * as WebBrowser from 'expo-web-browser';
import { useGetWorkouts } from "../app/api-calls/Workouts/Workouts";
import { workoutPdfMessage } from "../app/api-calls/helper";

interface Plan {
  id: string | number;
  title: string;
  description: string;
  createdAt: string;
  url: string;
}


export default function WorkoutPage() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch, isRefetching } = useGetWorkouts()

  const plans = data?.plans || [];
  useEffect(() => {
    refetch()
  }, [])

  let pdfDetails = workoutPdfMessage(data?.plans[0]?.url)

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView style={styles.mainContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Sidebar />
          <Text style={styles.title}>Workout Planner</Text>
        </View>

        <View style={styles.gridContainer}>
          <Card style={styles.card}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                <Text>Current Workout Plan</Text>
              </CardTitle>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              {isLoading || isRefetching ? (
                <View style={styles.skeletonContainer}>
                  <Skeleton style={styles.skeletonLine} />
                  <Skeleton style={styles.skeletonLineHalf} />
                  <Skeleton style={styles.skeletonLine} />
                </View>
              ) : error ? (
                <Text style={styles.errorText}>Error loading your workout plan.</Text>
              ) : plans.length > 0 ? (
                <View style={styles.planContainer}>
                  {plans.slice(0, 1).map((plan: Plan, idx: number) => (
                    <View key={plan.id || idx} style={styles.planItem}>
                      <FontAwesome5 name={"dumbbell"} size={30} color="black" />
                      <View style={styles.planDetails}>
                        <Text style={styles.planTitle}>{plan.title}</Text>
                        {plan.description && (
                          <Text style={styles.planDescription}>
                            {pdfDetails?.response?.displayName}
                            {/* {plan.description.length > 100
                              ? `${plan.description.substring(0, 100)}...`
                              : plan.description} */}
                          </Text>
                        )}
                        <Text style={styles.planDate}>
                          Created on {format(new Date(plan.createdAt), "PPP")}
                        </Text>
                      </View>
                      <Button
                        onPress={() => WebBrowser.openBrowserAsync(plan.url)}
                        style={styles.downloadButton}
                      >
                        <Feather size={16} color="white" />
                        <Text style={styles.buttonText}>Download Workout Plan</Text>
                      </Button>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <FontAwesome5 size={30} name={"dumbbell"} color="gray" style={styles.emptyStateIcon} />
                  <Text style={styles.emptyStateText}>No workout plans assigned yet.</Text>
                  <Text style={styles.emptyStateSubText}>
                    Your AI Agent will generate and upload them here.
                  </Text>
                </View>
              )}
            </CardContent>
          </Card>

          <Card style={styles.card}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                <Text>Progress Tracker</Text>
              </CardTitle>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              <View style={styles.emptyStateContainer}>
                <FontAwesome5 name={"spinner"} size={30} color="gray" style={styles.emptyStateIcon} />
                <Text style={styles.emptyStateText}>Track your workout progress over time.</Text>
                <Text style={styles.emptyStateSubText}>
                  Log your completed workouts and see your improvement.
                </Text>
              </View>
            </CardContent>
            <CardFooter>
              <Button variant="outline" disabled style={styles.comingSoonButton}>
                <Text style={styles.comingSoonButtonText}>Coming Soon</Text>
              </Button>
            </CardFooter>
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 12
    // marginBottom: 16,
  },
  gridContainer: {
    // flexDirection: "row",
    // flexWrap: "wrap",
    // justifyContent: "space-between",
  },
  card: {
    width: "100%", // Adjust as needed for spacing
    marginBottom: 16,
  },
  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardContent: {
    alignItems: "center",
    justifyContent: "center",

    // height: 192, // Equivalent to h-48
  },
  skeletonContainer: {
    width: "100%",
    gap: 8,
  },
  skeletonLine: {
    height: 16,
    width: "100%",
  },
  skeletonLineHalf: {
    height: 16,
    width: "75%",
  },
  errorText: {
    color: "red",
  },
  planContainer: {
    width: "100%",
    alignItems: "center",
  },
  planItem: {
    alignItems: "center",
    gap: 12,
  },
  planDetails: {
    alignItems: "center",
  },
  planTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },
  planDescription: {
    fontSize: 18,
    color: "gray",
    textAlign: "center",
    maxWidth: 250,
    fontWeight: "600"
  },
  planDate: {
    fontSize: 12,
    color: "gray",
  },
  downloadButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyStateContainer: {
    alignItems: "center",
    // paddingVertical: 40,
  },
  emptyStateIcon: {
    // marginBottom: 16,
  },
  emptyStateText: {
    color: "gray",
    marginVertical: 5,

  },
  emptyStateSubText: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
  },
  comingSoonButton: {
    width: "100%",
  },
  comingSoonButtonText: {
    color: "black",
  },
});
