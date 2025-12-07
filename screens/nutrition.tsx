import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Sidebar } from "../components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { format } from "date-fns";
import type { FoodLog, MealPlan } from "../shared/schema";
import { FileUpload } from "../components/ui/FileUpload";
import { validateFile, uploadFile } from "../lib/upload-helpers";
import * as WebBrowser from 'expo-web-browser';
import type { DocumentPickerAsset } from "expo-document-picker";
import { useGetFoodLogs, useGetMealPlans, useUploadFoodLog } from "../app/api-calls/FitnessTracking/FitnessTracking";
import Toast from "react-native-toast-message";

export default function Nutrition() {
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<DocumentPickerAsset | null>(null);

  const { data: foodLogs, isLoading: isLoadingLogs, refetch: refetchFoodLogs } = useGetFoodLogs()

  const { data: mealPlans, isLoading: isLoadingPlans } = useGetMealPlans()


  const cleanupMealPlansMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/cleanup-meal-plans");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to cleanup meal plans");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Cleanup Complete",
        description: `Removed ${data.deletedCount} duplicate meal plans`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Cleanup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { mutate: uploadFoodLogMutation, isPending: uploadFoodLogPending } = useUploadFoodLog()



  const uploadFoodLog = async (fileData: { file: DocumentPickerAsset, notes: string }) => {

    uploadFoodLogMutation(fileData, {
      onSuccess: (res) => {
        console.log("RESSS", res);
        refetchFoodLogs()
        queryClient.invalidateQueries({ queryKey: ["/api/food-logs"] });
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Food log uploaded successfully",

        });
        setNotes("");
        setSelectedFile(null);
      },
      onError: (error: Error) => {
        console.log("ERROR", error);

        Toast.show({
          type: "error",
          text1: "Error",
          text2: error?.message || "Error uploading file",

        });
      },
    });

  }





  const handleFileSelect = (file: DocumentPickerAsset) => {
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Upload Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadFoodLog({ file: selectedFile, notes });
    } catch (error) {
      // Error will be handled by mutation's onError callback
    }
  };

  if (isLoadingLogs || isLoadingPlans) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  console.log("foodLogsfoodLogs", selectedFile);


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.mainContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Sidebar />
          <View style={{ marginLeft: 12 }}>

            <Text style={styles.title}>Nutrition</Text>


          </View>
        </View>

        <View style={styles.gridContainer}>
          <Card style={styles.card}>
            <CardHeader>
              <CardTitle>Upload Food Log</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.formGroup}>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept=".pdf,.png,.jpeg,.jpg"
                  label="Choose food log file"
                  allowedTypes={[".pdf", ".png", ".jpeg", ".jpg"]}
                  maxSize={5 * 1024 * 1024} // 5MB
                />

                {
                  selectedFile && selectedFile.uri && (
                    <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between', borderWidth: 1, borderColor: 'gray', padding: 5, borderRadius: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 1 }}>
                        <View style={{ width: 50, height: 50, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center', }}>
                          <FontAwesome5 name="file-pdf" size={20} color="gray" />



                        </View>
                        <Text style={{ maxWidth: "70%", marginLeft: 10, flexShrink: 1, top: 5 }} numberOfLines={1}>{selectedFile?.name}</Text>

                      </View>
                      <TouchableOpacity
                        hitSlop={5}
                        onPress={() => setSelectedFile(null)} style={styles.clearImageButton}>
                        <FontAwesome5 name="trash" size={14} color="red" />
                      </TouchableOpacity>

                    </View>


                  )
                }
                <View style={{ marginTop: 12 }}>
                  <Textarea
                    placeholder="Add notes about your food log..."
                    value={notes}
                    onChangeText={setNotes}
                    editable={!uploadFoodLogPending}
                  />
                </View>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleUpload}
                  disabled={!selectedFile || uploadFoodLogPending}
                >
                  {uploadFoodLogPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.uploadButtonText}>Upload Food Log</Text>
                  )}
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>

          <Card style={styles.card}>
            <CardHeader>
              <View style={styles.cardHeaderContent}>
                <CardTitle>Your Meal Plans</CardTitle>
                {mealPlans && mealPlans?.plans?.length > 1 && (
                  <TouchableOpacity
                    onPress={() => cleanupMealPlansMutation.mutate()}
                    disabled={cleanupMealPlansMutation.isPending}
                    style={styles.cleanupButton}
                  >
                    {cleanupMealPlansMutation.isPending ? (
                      <ActivityIndicator size="small" color="black" />
                    ) : (
                      <Text style={styles.cleanupButtonText}>Remove Duplicates</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </CardHeader>
            <CardContent>
              <View style={styles.mealPlansContainer}>
                {mealPlans && mealPlans?.plans?.length > 0 ? (
                  mealPlans?.plans?.map((plan: MealPlan, idx: number) => (
                    console.log("MEAL PLANS", plan),
                    <View
                      key={plan.id || idx}
                      style={styles.mealPlanItem}
                    >
                      <View style={styles.mealPlanContent}>
                        <Text style={styles.mealPlanTitle}>{plan.title || "Meal Plan Generated by ONE"}</Text>
                        {plan.description && (
                          <Text style={styles.mealPlanDescription}>
                            {plan.description}
                          </Text>
                        )}
                        <Text style={styles.mealPlanDate}>
                          Created on {format(new Date(plan.createdAt || plan.uploadedAt), "MMM d, yyyy 'at' h:mm a")}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          const urlToOpen = plan.url || plan.filePath;
                          if (urlToOpen) {
                            WebBrowser.openBrowserAsync(urlToOpen);
                          }
                        }}
                        style={[styles.downloadButton, !(plan.url || plan.filePath) && styles.disabledButton]}
                        disabled={!(plan.url || plan.filePath)}
                      >
                        <Feather name="file-text" size={16} color="white" />
                        <Text style={styles.downloadButtonText}>Download Meal Plan</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Feather name="file-text" size={48} color="gray" style={styles.emptyStateIcon} />
                    <Text style={styles.emptyStateText}>
                      No meal plans assigned yet
                    </Text>
                    <Text style={styles.emptyStateSubText}>
                      Your AI Agent will generate and save them here automatically
                    </Text>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>

          <Card style={styles.fullWidthCard}>
            <CardHeader>
              <CardTitle>Food Log History</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.foodLogsContainer}>
                {foodLogs?.length ? (
                  foodLogs.map((log: FoodLog) => (
                    <View
                      key={log.id}
                      style={styles.foodLogItem}
                    >
                      <View>
                        <Text style={styles.foodLogDate}>
                          {format(new Date(log.uploadedAt), "MMM d, yyyy")}
                        </Text>
                        {log.notes && <Text style={styles.foodLogNotes}>{log.notes}</Text>}
                        <TouchableOpacity
                          onPress={() => WebBrowser.openBrowserAsync(log.filePath)}
                          style={styles.viewLogButton}
                        >
                          <Feather name="file-text" size={16} color="blue" />
                          <Text style={styles.viewLogButtonText}>View Food Log</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyStateText}>
                    No food logs uploaded yet
                  </Text>
                )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
  fullWidthCard: {
    width: "100%",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  clearImageButton: {
    // position: "absolute",
    // top: 2,
    // right: 2,
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'white',
    borderWidth: 1
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  cardHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  cleanupButton: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  cleanupButtonText: {
    fontSize: 12,
    color: "black",
  },
  mealPlansContainer: {
    marginTop: 10,
  },
  mealPlanItem: {
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  mealPlanContent: {
    marginBottom: 10,
  },
  mealPlanTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  mealPlanDescription: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },
  mealPlanDate: {
    fontSize: 10,
    color: "gray",
    marginTop: 5,
  },
  downloadButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  disabledButton: {
    backgroundColor: "#A9A9A9", // DarkGray for disabled state
  },
  downloadButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateIcon: {
    marginBottom: 20,
  },
  emptyStateText: {
    color: "gray",
    marginBottom: 5,
  },
  emptyStateSubText: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
  },
  foodLogsContainer: {
    marginTop: 10,
  },
  foodLogItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 10,
    marginBottom: 10,
  },
  foodLogDate: {
    fontSize: 12,
    color: "gray",
  },
  foodLogNotes: {
    marginTop: 5,
  },
  viewLogButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  viewLogButtonText: {
    color: "blue",
    // textDecorationLine: "underline",
  },
});
