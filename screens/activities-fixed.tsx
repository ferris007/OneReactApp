import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Image as RNImage,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { useToast } from "../hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { activitySchema, type ActivityFormData, type Activity } from "../shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { format, parseISO } from "date-fns";
import { FontAwesome, Feather, FontAwesome5 } from "@expo/vector-icons";
import { Button } from "../components/ui/Button";
import { Sidebar } from "../components/layout/Sidebar";
import * as ImagePicker from 'expo-image-picker';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/Form";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Select } from "../components/ui/Select";
import { Calendar, DateData } from "react-native-calendars";
import { FileUpload } from "../components/ui/FileUpload";
import type { DocumentPickerAsset } from "expo-document-picker";
import { useAddActivities, useGetActivities } from "../app/api-calls/Activities/activities";
import Toast from "react-native-toast-message";

const activityTypes = [
  "PunchNFIT",
  "Running",
  "Walking",
  "Cycling",
  "Swimming",
  "Weight Training",
  "ONE's Workout Plan",
  "Yoga",
  "Pilates",
  "HIIT",
  "Other",
];
const weightTypes = [
  "lb",
  "kg",

];

export default function Activities() {
  const { toast } = useToast();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [selectedActivityType, setSelectedActivityType] = useState("PunchNFIT");
  const [excersiseName, setExcerciseName] = useState("");
  const [weight, setWeight] = useState("");
  const [selectedWeightType, setSelectedWeightType] = useState("lb")

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      activityType: "",
      description: "",
    },
  });

  const { data: activities, isLoading, refetch: refetchActivities } = useGetActivities()


  const { mutate: addActivity, isPending } = useAddActivities()
  console.log("activities", activities);




  const addActivityMutation = (formData: any) => {
    console.log("FORM DATA", formData);
    addActivity(formData, {


      onSuccess: () => {
        Toast.show({ type: "success", text2: "Your activity has been recorded.", text1: 'Success' });
        queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
        form.reset();
        refetchActivities()
        setSelectedFile(null);
      },
      onError: (error: Error) => {
        Toast.show({ type: "error", text2: "Failed to add activity.", text1: 'Error' });

      },
    })
  }

  const onSubmit = (data: ActivityFormData) => {
    const formData = new FormData();
    if (data.activityType === "") {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please select activity type"
      })
      return
    }


    formData.append("date", data.date);
    formData.append("activityType", data.activityType);
    formData.append("description", data.description);


    console.log("FORM DATA", formData);




    if (selectedFile) {
      // This is the standard way to append a file for upload in React Native.
      // The `as any` cast is a common workaround because the FormData type
      // definitions do not account for this specific object structure.
      formData.append("file", {
        uri: selectedFile.uri,
        name: selectedFile.fileName ?? 'image.jpg',
        type: selectedFile.mimeType ?? 'image/jpeg',
      } as any);

    }

    addActivityMutation(formData);
  };

  const handleFileSelect = (file: DocumentPickerAsset) => {
    setSelectedFile(file);
  };

  const addQuickWeights = () => {
    let formData = new FormData()
    const today = new Date();

    const formattedDate = today.getFullYear() + "-" +
      String(today.getMonth() + 1).padStart(2, "0") + "-" +
      String(today.getDate()).padStart(2, "0");

    if (excersiseName === "") {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter excercise name"
      })
      return
    }


    formData.append("date", formattedDate)
    formData.append("activityType", "Weight Training")
    formData.append("description", excersiseName + ": " + weight + " " + selectedWeightType)

    addActivityMutation(formData)

    setWeight("")
    setExcerciseName("")


  }

  useEffect(() => {
    refetchActivities()
  }, [])


  const currentDate = form.getValues("date");
  const markedCalendarDates = currentDate ? { [currentDate]: { selected: true, selectedColor: '#007BFF' } } : {};
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
    <Sidebar />
    <Text style={styles.title}>Dashboard</Text>
  </View>



  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
    });



    if (!result.canceled) {
      setSelectedFile(result?.assets[0]);
      // setImagePreview(result.assets[0].uri);
      // setImageFile(result.assets[0]);
    }
  };


  console.log("ACTIVITES", activities);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 5, android: 0 }) ?? 0}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.mainContent}>
          <View style={styles.headerContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
              <Sidebar />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.title}>Activity Tracker</Text>
                <Text style={styles.subtitle}>
                  Record your daily activities and track your fitness journey.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.gridContainer}>
            <Card style={styles.card}>
              <CardHeader>
                <CardTitle>Add New Activity</CardTitle>
                <CardDescription>
                  Log your activities with date, type, description and optional
                  photo evidence.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <View style={styles.formSpace}>
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem style={styles.formItem}>
                          <FormLabel>Date</FormLabel>
                          <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            style={styles.datePickerButton}
                          >
                            <Text style={styles.datePickerButtonText}>
                              {field?.value
                                ? format(parseISO(field.value), "PPP")
                                : "Pick a date"
                              }
                            </Text>
                            <FontAwesome name="calendar" size={16} color="black" />
                          </TouchableOpacity>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="activityType"
                      render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <View>
                          <FormLabel>Activity Type</FormLabel>
                          <View style={styles.dietInputGroup}>
                            <Select
                              onValueChange={onChange}
                              value={value}
                              placeholder={{ label: 'Select activity type', value: null }}
                              items={activityTypes.map(type => ({ label: type, value: type }))}
                              useNativeAndroidPickerStyle={false}
                            />
                          </View>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </View>

                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem style={styles.formItem}>
                          <FormLabel>Description</FormLabel>
                          <Textarea
                            placeholder="Describe your activity, including weights used for each exercise, duration, intensity and how you felt"
                            value={field.value}
                            onChangeText={field.onChange}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <View style={styles.photoEvidenceContainer}>
                      <FormLabel>Photo Evidence (Optional)</FormLabel>
                      <Button
                        onPress={handleImageUpload}
                      ><Text>Choose photo</Text></Button>
                      {
                        selectedFile && selectedFile.uri && (
                          <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between', borderWidth: 1, borderColor: 'gray', padding: 5, borderRadius: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 1 }}>
                              <View style={{ width: 85, height: 80, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center', }}>
                                <Image
                                  style={{ width: 85, height: 80, borderRadius: 8, }}
                                  resizeMode="cover"
                                  source={{ uri: selectedFile.uri }}
                                />



                              </View>
                              <Text style={{ marginLeft: 10, flexShrink: 1, top: 5 }} numberOfLines={1}>{selectedFile.fileName}</Text>

                            </View>
                            <TouchableOpacity
                              hitSlop={5}
                              onPress={() => setSelectedFile(null)} style={styles.clearImageButton}>
                              <FontAwesome5 name="trash" size={14} color="red" />
                            </TouchableOpacity>

                          </View>


                        )
                      }
                    </View>

                    <Button
                      disabled={isPending}
                      onPress={() => onSubmit(form.getValues())}
                      style={styles.saveActivityButton}
                    >
                      {isPending ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.buttonText}>Save Activity</Text>
                      )}
                    </Button>
                  </View>
                </Form>
              </CardContent>
            </Card>

            <View style={styles.rightColumn}>
              <Card style={styles.rightColumnCard}>
                <CardHeader>
                  <CardTitle>Live Activity Tracker</CardTitle>
                  {/* <CardDescription>
                    Live smartwatch data from your workouts. Select an activity type to view relevant metrics.
                  </CardDescription> */}
                </CardHeader>
                <CardContent>
                  <View style={styles.liveTrackerContent}>
                    <View style={styles.activityTypeSelection}>
                      <Text style={styles.activityTypeLabel}>Activity Type:</Text>
                      <View style={{ borderColor: "gray", borderWidth: 1, borderRadius: 8, padding: 10 }}>
                        <Select
                          onValueChange={setSelectedActivityType}
                          value={selectedActivityType}
                          placeholder={{ label: 'Select activity type', value: null }}
                          items={activityTypes.map(type => ({ label: type, value: type }))}
                          useNativeAndroidPickerStyle={false}
                          hideIcon={true}

                        />
                      </View>
                    </View>

                    <View style={styles.liveDataDisplay}>
                      <Text style={styles.watchIcon}>⌚</Text>
                      <Text style={styles.liveTrackerTitle}>Live Activity Tracker</Text>
                      {/* <Text style={styles.liveTrackerSubtitle}>
                        Activity type: <Text style={styles.boldText}>{selectedActivityType}</Text>
                      </Text>
                      <Text style={styles.liveTrackerDescription}>
                        Connect your smartwatch to see live metrics here.
                      </Text> */}
                      <Text style={{ fontSize: 18, fontWeight: '500' }}>Coming Soon</Text>

                    </View>
                  </View>
                </CardContent>
              </Card>

              <Card style={styles.rightColumnCard}>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>
                    Your most recent activities are shown here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                  ) : activities && activities?.length > 0 ? (

                    <View style={styles.activitiesList}>
                      {activities?.map((activity: any) => (
                        console.log("activity.filePath", activity.filePath),
                        <Card key={activity.id} style={styles.activityCard}>
                          <View style={styles.activityCardContent}>
                            {activity.filePath && (
                              <View style={styles.activityImageContainer}>
                                <RNImage
                                  source={{ uri: activity.filePath }}
                                  style={styles.activityImage}
                                  onError={(e) => console.log("Image error", e.nativeEvent.error)}
                                />
                              </View>
                            )}
                            <View style={styles.activityDetails}>
                              <View style={styles.activityHeader}>
                                <Text style={styles.activityType}>{activity.activityType}</Text>
                                <Text style={styles.activityDate}>
                                  {activity.date || activity.createdAt
                                    ? format(new Date((activity.date || activity.createdAt) + "T00:00:00"), "MMM d, yyyy")
                                    : "No date available"}
                                </Text>
                              </View>
                              <Text style={styles.activityDescription}>
                                {activity.description}
                              </Text>
                            </View>
                          </View>
                        </Card>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyStateContainer}>
                      <Feather name="camera-off" size={48} color="gray" style={styles.emptyStateIcon} />
                      <Text style={styles.emptyStateTitle}>
                        No activities recorded
                      </Text>
                      <Text style={styles.emptyStateDescription}>
                        Add your first activity using the form on the left.
                      </Text>
                    </View>
                  )}
                </CardContent>
              </Card>
              <Card style={styles.rightColumnCard}>
                <CardHeader>
                  <CardTitle>Quick Weight Entry</CardTitle>
                  <CardDescription>
                    Add a quick weight entry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormItem>
                    <FormLabel>Excercise Name</FormLabel>
                    <FormControl>
                      <Input
                        onChangeText={(text) => setExcerciseName(text)}
                        value={excersiseName}
                        placeholder="e.g Bench Press, Squats etc"
                      />
                    </FormControl>
                  </FormItem>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormItem style={{ width: '45%' }}>
                      <FormLabel>Wieght</FormLabel>
                      <FormControl>
                        <Input
                          onChangeText={(text) => setWeight(text)}
                          value={weight}
                          placeholder="e.g 100,150 etc"
                        />
                      </FormControl>
                    </FormItem>
                    <View style={{ width: '45%' }}>
                      <FormLabel>Unit</FormLabel>
                      <View style={styles.dietInputGroup}>
                        <Select
                          onValueChange={(value) => setSelectedWeightType(value)}
                          value={selectedWeightType}
                          placeholder={{ label: 'lb,kg', value: null }}
                          items={weightTypes.map(type => ({ label: type, value: type }))}
                          useNativeAndroidPickerStyle={false}

                        />
                      </View>
                    </View>
                  </View>
                  <Button
                    onPress={addQuickWeights} disabled={isPending}
                    style={styles.saveActivityButton}
                  >
                    {isPending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.buttonText}>Save Activity</Text>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </View>
          </View>
          <Modal
            transparent={true}
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <TouchableOpacity
              style={styles.modalContainer}
              activeOpacity={1}
              onPressOut={() => setShowDatePicker(false)}
            >
              <View style={styles.modalContent}>
                <Calendar
                  onDayPress={(day: DateData) => {
                    form.setValue("date", day.dateString);
                    setShowDatePicker(false);
                  }}
                  markedDates={markedCalendarDates}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
    maxWidth: '90%'
  },
  gridContainer: {
    // flexDirection: "row",
    // justifyContent: "space-between",
    // gap: 16,
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
  card: {
    // width: "48%", // Adjust as needed for spacing
  },
  formSpace: {
    gap: 16,
  },
  formItem: {
    marginBottom: 0, // Handled by formSpace gap
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: "black",
  },
  photoEvidenceContainer: {
    marginTop: 16,
  },
  saveActivityButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  rightColumn: {
    flex: 1,
    // width: "48%",
    gap: 16,
    marginVertical: 16,
  },
  rightColumnCard: {
    width: "100%",
  },
  liveTrackerContent: {
    alignItems: "center",
    // paddingVertical: 40,
  },
  activityTypeSelection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  activityTypeLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  liveDataDisplay: {
    alignItems: "center",
  },
  watchIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  liveTrackerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  liveTrackerSubtitle: {
    fontSize: 14,
    color: "gray",
  },
  boldText: {
    fontWeight: "bold",
  },
  liveTrackerDescription: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activitiesList: {
    marginTop: 10,
  },
  activityCard: {
    marginBottom: 10,
    overflow: "hidden",
  },
  activityCardContent: {
    flexDirection: "row",
  },
  activityImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#EEEEEE",
    justifyContent: "center",
    alignItems: "center",
  },
  activityImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  activityDetails: {
    flex: 1,
    padding: 10,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  activityType: {
    fontWeight: "bold",
  },
  activityDate: {
    fontSize: 12,
    color: "gray",
  },
  activityDescription: {
    fontSize: 12,
    color: "gray",
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateIcon: {
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dietInputGroup: {
    marginBottom: 16,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});
