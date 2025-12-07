import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from "react-native";
import { Sidebar } from "../components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Goal } from "../shared/schema";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/Form";
import { Input } from "../components/ui/Input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../app/context/useAuth";
import { useAddGoals, useGetMyGoals } from "../app/api-calls/FitnessTracking/FitnessTracking";
import Toast from "react-native-toast-message";
import MonthlyGoals from "../components/town-hall/MonthlyGoals";


const goalFormSchema = z.object({
  month: z.string().min(1, "Month is required"),
  weightLoss: z.number().min(0, "Weight loss must be positive"),
  muscleGain: z.number().min(0, "Muscle gain must be positive"),
  bodyFatReduction: z.number().min(0, "Body fat reduction must be positive"),
  status: z.string().optional(),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

export default function Goals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),

    defaultValues: {
      month: new Date().toISOString().slice(0, 7),
      weightLoss: 0,
      muscleGain: 0,
      bodyFatReduction: 0,
      status: "in_progress",

    },
  });

  const { data: goals, isLoading, refetch: refetchGoals } = useGetMyGoals()


  const { mutate: mutateGoals, isPending } = useAddGoals()


  const goalMutation = (values: any) => {
    // if (!user) return
    try {
      const data = {
        month: values.month,
        weightLoss: Number(values.weightLoss),
        muscleGain: Number(values.muscleGain),
        userId: user?.id,
      };
      mutateGoals(data, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
          refetchGoals()
          form.reset();
          setIsSubmitting(false);
          Toast.show({
            type: "success",
            text2: "Goal added successfully",
            text1: 'Success',
          });
        },
        onError: (error: Error) => {
          // console.error("Goal mutation error:", error);
          setIsSubmitting(false);
          Toast.show({
            type: "error",
            text2: error.message || "Failed to add goal",
            text1: "error",
          });
        }
      })

    } catch (error) {
      console.error("Goal mutation error:", error);
      throw error;
    }


  }

  // const goalMutation = useMutation({
  //   mutationFn: async (values: GoalFormValues) => {
  //     if (!user || !user.id) {
  //       throw new Error("User ID is required. Please log in again.");
  //     }

  //     try {
  //       const data = {
  //         month: values.month,
  //         weightLoss: Number(values.weightLoss),
  //         muscleGain: Number(values.muscleGain),
  //         bodyFatReduction: Number(values.bodyFatReduction),
  //         userId: user.id,
  //       };
  //       const res = await apiRequest("POST", "/api/goals", data);
  //       const responseText = await res.text();

  //       let jsonResponse;
  //       try {
  //         jsonResponse = JSON.parse(responseText);
  //       } catch (e) {
  //         // Not JSON, that's fine
  //       }

  //       if (!res.ok) {
  //         throw new Error(responseText || res.statusText);
  //       }

  //       return jsonResponse || null;
  //     } catch (error) {
  //       console.error("Goal mutation error:", error);
  //       throw error;
  //     }
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
  //     form.reset();
  //     setIsSubmitting(false);
  //     toast({
  //       title: "Success",
  //       description: "Goal added successfully",
  //       variant: 'default',
  //     });
  //   },
  //   onError: (error: Error) => {
  //     console.error("Goal mutation error:", error);
  //     setIsSubmitting(false);
  //     toast({
  //       title: "Error",
  //       description: error.message || "Failed to add goal",
  //       variant: "destructive",
  //     });
  //   },
  // });

  const onSubmit = (data: GoalFormValues) => {

    // if (!user) {
    //   toast({
    //     title: "Error",
    //     description: "You must be logged in to set goals",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    setIsSubmitting(true);
    goalMutation(data);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.mainContent}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Sidebar />
          <View style={{ marginLeft: 12 }}>

            <Text style={styles.title}>Goals</Text>
            <Text style={styles.subtitle}>
              Set your fitness goals to earn VII reward tokens when you achieve them.
            </Text>

          </View>
        </View>

        <Text style={styles.rewardsText}>
          • 🏆 Weight Loss: 20 VII
        </Text>
        <Text style={styles.rewardsText}>
          • 💪 Muscle Gain: 15 VII
        </Text>

        <View style={styles.gridContainer}>
          <Card style={styles.card}>
            <CardHeader>
              <CardTitle>Set New Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <View>
                  <FormField
                    control={form.control}
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Month</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="YYYY-MM"
                            value={field.value}
                            onChangeText={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weightLoss"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight Loss Goal (lbs) - 20 VII Reward</FormLabel>
                        <FormControl>
                          <Input
                            keyboardType="numeric"
                            placeholder="0.0"
                            value={field.value?.toString() || ""}
                            onChangeText={(text) => {
                              const numValue = parseFloat(text);
                              field.onChange(isNaN(numValue) ? undefined : numValue);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="muscleGain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Muscle Gain Goal (lbs) - 15 VII Reward</FormLabel>
                        <FormControl>
                          <Input
                            keyboardType="numeric"
                            placeholder="0.0"
                            value={field.value?.toString() || ""}
                            onChangeText={(text) => {
                              const numValue = parseFloat(text);
                              field.onChange(isNaN(numValue) ? undefined : numValue);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                    control={form.control}
                    name="bodyFatReduction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Fat Reduction Goal (%) - 12 VII Reward</FormLabel>
                        <FormControl>
                          <Input
                            keyboardType="numeric"
                            placeholder="0.0"
                            value={field.value?.toString() || ""}
                            onChangeText={(text) => {
                              const numValue = parseFloat(text);
                              field.onChange(isNaN(numValue) ? undefined : numValue);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  <Button
                    onPress={() => onSubmit(form.getValues())}
                    disabled={isSubmitting || isPending}
                    style={styles.submitButton}
                  >
                    {isSubmitting || isPending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.buttonText}>Add Goal</Text>
                    )}
                  </Button>
                </View>
              </Form>
            </CardContent>
          </Card>

          <Card style={styles.card}>
            <CardHeader>
              <CardTitle>Current Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.goalsList}>
                {goals && goals.length > 0 ? (
                  goals.map((goal: any) => (
                    <View key={goal.id} style={styles.goalItem}>
                      <Text style={styles.goalMonth}>{goal.month}</Text>
                      <View style={styles.goalDetails}>
                        <Text>Weight Loss: {goal.weightLoss} lbs</Text>
                        <Text>Muscle Gain: {goal.muscleGain} lbs</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.noGoalsContainer}>
                    <Text style={styles.noGoalsText}>No goals found</Text>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>

          <Card style={[styles.card, {
            marginBottom: 20
          }]}>
            <CardHeader>
              <CardTitle>Monthly Goals</CardTitle>
            </CardHeader>
            {goals && goals.length > 0 ? (
              <MonthlyGoals />
            ) :
              <View style={styles.noGoalsContainer}>
                <Text>No goals set for this month</Text>
              </View>
            }

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
    marginBottom: 8, flex: 1,
    maxWidth: '90%'

  },
  rewardsText: {
    fontSize: 14,
    color: "gray",
    marginVertical: 8,
    // flex: 1,
    maxWidth: '100%',
    fontWeight: '600',
    textAlign: 'left'

  },
  gridContainer: {
    // flexDirection: "row",
    // flexWrap: "wrap",
    // justifyContent: "space-between",
    marginTop: 16
  },
  card: {
    width: "100%", // Adjust as needed for spacing
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#DC2626",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
  },
  goalsList: {
    marginTop: 10,
  },
  goalItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 10,
    marginBottom: 10,
  },
  goalMonth: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  goalDetails: {
    marginLeft: 10,
  },
  noGoalsContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noGoalsText: {
    color: "gray",
  },
});
