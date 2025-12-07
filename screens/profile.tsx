import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { Sidebar } from "../components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Select } from "../components/ui/Select";
import { Checkbox } from "../components/ui/Checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import { queryClient, apiRequest } from "../lib/queryClient";
import { Measurement } from "../shared/schema";
import { format } from "date-fns";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import { router } from "expo-router";
import { useGetBloodReports, useGetMeasurements, useGetMyProfile, useUpdateProfile, useUploadBloodReports } from "../app/api-calls/Profile/profile";
import http from "../app/api-calls/http";
import Toast from "react-native-toast-message";
import { useDeleteBloodReports } from "../app/api-calls/FitnessTracking/FitnessTracking";
import { useAuth } from "../app/context/useAuth";
import { useUserDetails } from "../app/api-calls/Auth/auth";
import { isValidUSZipCode } from "../app/api-calls/helper";

// Unit conversion utilities (same as measurements page)
const convertWeight = (
  value: number,
  fromUnit: 'lbs' | 'kg',
  toUnit: 'lbs' | 'kg',
): number => {
  if (fromUnit === toUnit) return value;
  if (fromUnit === 'lbs' && toUnit === 'kg') return value * 0.453592;
  if (fromUnit === 'kg' && toUnit === 'lbs') return value * 2.20462;
  return value;
};

// Display formatting functions
const formatWeight = (
  value: number,
  displaySystem: 'metric' | 'imperial',
): string => {
  if (displaySystem === 'imperial') {
    const lbs = convertWeight(value, 'kg', 'lbs');
    return `${lbs.toFixed(1)} lbs`;
  }
  return `${value.toFixed(1)} kg`;
};

export default function Profile() {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [profileData, setProfileData] = useState<any>(null);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('imperial'); // Default to imperial to match user preference
  const { toast } = useToast();
  const { data, refetch, isRefetching } = useUserDetails()
  const { user, login, updateUser } = useAuth()





  const { data: profile, isLoading: isLoadingProfile, refetch: refetchProfile } = useGetMyProfile()
  const { data: measurements, isLoading: isLoadingMeasurements } = useGetMeasurements()
  // const { data: bloodTestResults, isLoading: isLoadingBloodTests, refetch: refetchBloodTests } = useGetBloodReports()


  console.log("profileprofileprofile", profile);

  const { mutate: updateProfile, isPending, } = useUpdateProfile()




  const updateProfileMutation = (editData: any) => {
    console.log("EDIT DATA", editData);

    updateProfile(editData, {
      onSuccess: async (updatedProfile) => {
        await refetch()
        console.log("PROFULE DATA", updatedProfile, user);

        // setProfileData(updatedProfile);
        queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        queryClient.setQueryData(['/api/profile'], updatedProfile);
        queryClient.setQueryData(['/api/user'], updatedProfile);
        Toast.show({
          type: "success",
          text2: "Your profile has been successfully updated.",
          text1: 'Success',
        });
        setEditingSection(null);
        setEditData({});
        refetchProfile();
      },
      onError: (error: Error) => {
        console.log("ERROR", error);

        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    })

  }

  const startEditing = (section: string) => {
    setEditingSection(section);
    const currentProfile = profileData || profile;
    setEditData({ ...currentProfile });
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditData({});
  };
  useEffect(() => {
    refetchProfile()
  }, [])
  const saveChanges = () => {

    console.log("EDIT DATA", editData);

    if (editData?.zip_code !== "" && editData?.zip_code?.length > 0) {
      let checkValidZipCode = isValidUSZipCode(editData?.zip_code)
      if (!checkValidZipCode) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please enter valid US zip code"
        })
        return
      }

    }

    if (!editData || Object.keys(editData).length === 0) {

      toast({
        title: "No Changes",
        description: "No data to save. Please make changes first.",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation(editData);
  };

  const updateEditData = (field: string, value: any) => {
    setEditData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };


  // const { mutate: uploadBloodReports, isPending: bloodReportPending } = useUploadBloodReports()




  // const uploadBloodTestMutation = (formData: any) => {

  //   uploadBloodReports(formData, {
  //     onSuccess: () => {
  //       Toast.show({
  //         type: "success",
  //         text1: "Success",
  //         text2: "Blood report uploaded successfully"
  //       })
  //       refetchBloodTests();
  //     },
  //     onError: (error) => {
  //       console.log("ERROR",error);

  //       Toast.show({
  //         type: "error",
  //         text1: "Error",
  //         // text2: error?.response?.data?.detail || "Failed"j
  //       })

  //     },
  //   });
  // }

  const { mutate: deletereports, isPending: deleteBRPending } = useDeleteBloodReports()



  // const deleteBloodTestMutation = async (resultId: string) => {

  //   deletereports(resultId, {
  //     onSuccess: () => {
  //       toast({
  //         title: "Success",
  //         description: "Blood test result deleted successfully",
  //         variant: 'default',
  //       });
  //       refetchBloodTests();
  //     },
  //     onError: (error) => {
  //       toast({
  //         title: "Delete Failed",
  //         description: error.message || "Failed to delete blood test",
  //         variant: "destructive",
  //       });
  //     }
  //   })

  // }






  // const handleBloodTestUpload = async () => {
  //   try {
  //     const result = await DocumentPicker.getDocumentAsync({
  //       type: ['application/pdf', 'image/*'],
  //       copyToCacheDirectory: true,
  //       multiple: false,
  //     });

  //     if (result.canceled || !result.assets || !result.assets[0]) {
  //       return;
  //     }

  //     const file = result.assets[0];

  //     const formData = new FormData();
  //     formData.append('bloodTest', {
  //       uri: file.uri,
  //       name: file.name,
  //       type: file.mimeType || 'application/octet-stream',
  //     } as any);
  //     formData.append('notes', 'Hello');

  //     uploadBloodTestMutation(formData);
  //   } catch (err) {
  //     console.error("Unknown error:", err);
  //     toast({
  //       title: "Error",
  //       description: "Failed to pick document.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  useEffect(() => {
    if (user) {
      login(data)
    }
  }, [isRefetching])


  console.log("USER", user);



  if (isLoadingProfile || isLoadingMeasurements) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const latestMeasurement = measurements?.[measurements.length - 1];
  const currentProfile = profileData || profile;



  return (
    <SafeAreaView style={styles.container}>

      <ScrollView style={styles.mainContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Sidebar />
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>
              Your complete fitness and health profile
            </Text>
          </View>
        </View>

        <View style={styles.gridContainer}>
          {/* Personal Information */}
          <Card style={styles.card}>
            <CardHeader>
              <View style={styles.cardHeaderContent}>
                <View style={styles.cardTitleContainer}>
                  <Feather name="user" size={20} color="black" />
                  <CardTitle size={16}>Personal Information</CardTitle>
                </View>
                {editingSection === "personal" ? (
                  <View style={styles.buttonGroup}>
                    <Button
                      onPress={saveChanges}
                      disabled={isPending}
                    >
                      <Feather name="save" size={16} color="white" />
                      {/* <Text style={styles.buttonText}>Save</Text> */}
                    </Button>
                    <Button
                      onPress={cancelEditing}
                      disabled={isPending}
                      variant="outline"
                      style={{ marginLeft: 8 }}
                    >
                      <Feather name="x" size={16} color="black" />
                      {/* <Text style={styles.buttonText}>Cancel</Text> */}
                    </Button>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => startEditing("personal")}

                    style={{
                      paddingHorizontal: 12, paddingVertical: 8,
                      flexDirection: 'row', alignItems: 'center', gap: 4,
                      borderWidth: 1,
                      borderRadius: 8

                    }}>
                    <Feather name="edit-2" size={16} color="black" />
                    <Text style={styles.buttonText}>Edit</Text>

                  </TouchableOpacity>


                )}
              </View>
            </CardHeader>
            <CardContent>
              {editingSection === "personal" ? (
                <View style={styles.formGrid}>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Name</Text>
                    <Input
                      value={editData?.name || ""}
                      onChangeText={(text: string) => updateEditData("name", text)}
                      placeholder="Enter your name"
                    />
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Username</Text>
                    <Input
                      editable={false}
                      value={editData?.username || ""}
                      onChangeText={(text: string) => updateEditData("username", text)}
                      placeholder="Enter your name"
                    />
                    <Text style={styles.hintText}>Username cannot be changed</Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Email</Text>
                    <Input
                      value={editData?.email || ""}
                      onChangeText={(text: string) => updateEditData("email", text)}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                    />
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Phone</Text>
                    <Input
                      value={editData?.phone || ""}
                      onChangeText={(text: string) => updateEditData("phone", text)}
                      placeholder="Enter your phone"
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>City</Text>
                    <Input
                      value={editData?.city || ""}
                      onChangeText={(text: string) => updateEditData("city", text)}
                      placeholder="Enter your city"
                    />
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Zip Code</Text>
                    <Input
                      keyboardType="numeric"
                      value={editData?.zip_code || ""}
                      onChangeText={(text: string) => updateEditData("zip_code", text)}
                      placeholder="Enter your zip code"
                    />
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Age</Text>
                    <Input
                      value={editData?.age?.toString() || ""}
                      onChangeText={(text: string) => updateEditData("age", parseInt(text) || null)}
                      placeholder="Enter your age"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Height</Text>
                    <Input
                      value={editData?.height || ""}
                      onChangeText={(text: string) => updateEditData("height", text)}
                      placeholder="e.g., 6'2 inches, 180cm"
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.formGrid}>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.valueText}>
                      {currentProfile?.name || "Not provided"}
                    </Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Username</Text>
                    <Text style={styles.valueText}>
                      {currentProfile?.username || "Not provided"}
                    </Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.valueText}>
                      {currentProfile?.email || "Not provided"}
                    </Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Phone</Text>
                    <Text style={styles.valueText}>
                      {currentProfile?.phone || "Not provided"}
                    </Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>City</Text>
                    <Text style={styles.valueText}>
                      {currentProfile?.city || "Not provided"}
                    </Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Zip Code</Text>
                    <Text style={styles.valueText}>
                      {currentProfile?.zip_code || "Not provided"}
                    </Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Age</Text>
                    <Text style={styles.valueText}>
                      {currentProfile?.age || "Not provided"}
                    </Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Height</Text>
                    <Text style={styles.valueText}>
                      {currentProfile?.height || "Not provided"}
                    </Text>
                  </View>
                </View>
              )}
            </CardContent>
          </Card>

          {/* Nutrition Profile */}
          <Card style={styles.card}>
            <CardHeader>
              <View style={styles.cardTitleContainer}>
                <FontAwesome5 name="nutritionix" size={20} color="black" />
                <CardTitle size={16}>Nutrition Profile</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <View style={styles.sectionContent}>
                <View>
                  <Text style={styles.label}>Diet Type</Text>
                  <Text style={styles.valueText}>
                    {currentProfile?.dietType || "Not specified"}
                  </Text>
                </View>
                <View>
                  <Text style={styles.label}>Daily Diet Description</Text>
                  <Text style={styles.valueText}>
                    {currentProfile?.dailyDiet || "Not provided"}
                  </Text>
                </View>
                <View style={styles.twoColumnGrid}>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Water Intake</Text>
                    <Text style={styles.valueText}>
                      {profile?.waterIntake || "Not specified"}
                    </Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Nutrition Rating</Text>
                    <Text style={styles.valueText}>
                      {profile?.nutritionRating
                        ? `${profile?.nutritionRating}/10`
                        : "Not rated"}
                    </Text>
                  </View>
                </View>
                <View style={styles.badgeContainer}>
                  {profile?.coffeeDrinker && (
                    <Badge variant="secondary">
                      Coffee Drinker {(profile?.coffeeCupsPerDay ? `(${profile?.coffeeCupsPerDay} cups/day)` : "")}
                    </Badge>
                  )}
                  {profile?.alcoholDrinker && (
                    <Badge variant="secondary">
                      Alcohol {(profile?.alcoholPerWeek ? `(${profile?.alcoholPerWeek})` : "")}
                    </Badge>
                  )}
                  {profile?.smoker && (
                    <Badge variant="destructive">
                      Smoker {(profile?.smokingFrequency ? `(${profile?.smokingFrequency})` : "")}
                    </Badge>
                  )}
                </View>
                {profile?.dietaryRestrictions && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Dietary Restrictions</Text>
                    <Text style={styles.valueText}>
                      {profile?.dietaryRestrictions || "Not Specified"}
                    </Text>
                  </View>
                )}
                {/* {profile?.medicationsSupplements && ( */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.label}>Medications & Supplements</Text>
                  <Text style={styles.valueText}>
                    {profile?.medicationsSupplements || "Not Specified"}
                  </Text>
                </View>
                {/* )} */}
              </View>
            </CardContent>
          </Card>

          {/* Fitness & Exercise */}
          <Card style={styles.card}>
            <CardHeader>
              <View style={styles.cardTitleContainer}>
                <FontAwesome5 name="dumbbell" size={20} color="black" />
                <CardTitle size={16}>Fitness & Exercise</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <View style={styles.sectionContent}>
                <View>
                  <Text style={styles.label}>Fitness Level</Text>
                  <Text style={styles.valueText}>
                    {profile?.fitnessLevel || "Not specified"}
                  </Text>
                </View>
                {profile?.currentExercises && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Current Exercises</Text>
                    <Text style={styles.valueText}>
                      {profile?.currentExercises}
                    </Text>
                  </View>
                )}
                {profile?.personalRecords && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Personal Records</Text>
                    <Text style={styles.valueText}>
                      {profile?.personalRecords}
                    </Text>
                  </View>
                )}
                {profile?.playedSports && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Sports Background</Text>
                    <Text style={styles.valueText}>
                      {profile?.playedSports}
                    </Text>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>

          {/* Health & Lifestyle */}
          <Card style={styles.card}>
            <CardHeader>
              <View style={styles.cardTitleContainer}>
                <FontAwesome5 name="heartbeat" size={20} color="black" />
                <CardTitle size={16}>Health & Lifestyle</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <View style={styles.sectionContent}>
                <View style={styles.twoColumnGrid}>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Stress Level</Text>
                    <Text style={styles.valueText}>
                      {profile?.stressLevel
                        ? `${profile?.stressLevel}/10`
                        : "Not rated"}
                    </Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Sleep Hours</Text>
                    <Text style={styles.valueText}>
                      {profile?.sleepHours
                        ? `${profile?.sleepHours} hours`
                        : "Not specified"}
                    </Text>
                  </View>
                </View>
                <View style={styles.badgeContainer}>
                  {profile?.stressPains && <Badge variant="outline">Stress-related Pains</Badge>}
                  {profile?.stressEater === null || profile?.stressEater && <Badge variant="outline">Stress Eater</Badge>}
                  {profile?.teethGrinding && <Badge variant="outline">Teeth Grinding</Badge>}
                </View>
                {profile?.injuries && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Injuries</Text>
                    <Text style={styles.valueText}>
                      {profile?.injuries}
                    </Text>
                  </View>
                )}
                {profile?.hadSurgery && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>Surgery History</Text>
                    <Text style={styles.valueText}>
                      Had surgery {profile?.surgeryDate ? `on ${profile?.surgeryDate}` : ""}
                    </Text>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card style={styles.card}>
            <CardHeader>
              <View style={styles.cardTitleContainer}>
                <FontAwesome5 name="running" size={20} color="black" />
                <CardTitle size={16}>Fitness Goals</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              {profile?.fitnessGoals ? (
                <Text style={styles.valueText}>{profile?.fitnessGoals}</Text>
              ) : (
                <Text style={styles.mutedText}>No fitness goals specified</Text>
              )}
            </CardContent>
          </Card>

          {/* Latest Measurements */}

          <Card style={styles.card}>
            <CardHeader>
              <View style={styles.cardHeaderContent}>
                <View style={styles.cardTitleContainer}>
                  <FontAwesome5 name="ruler-vertical" size={20} color="black" />
                  <CardTitle size={16}>Latest Measurements</CardTitle>
                </View>
                <TouchableOpacity onPress={() => router.push('/measurements')}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 8,
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                    borderWidth: 1,
                    borderRadius: 8

                  }}>
                  <Text style={styles.buttonText}>View All</Text>

                </TouchableOpacity>
              </View>
              {measurements && measurements.length > 0 && (
                <Text style={styles.mutedText}>
                  {measurements[0].date ? format(new Date(measurements[0].date), "MMMM d, yyyy") : "Recent"}
                </Text>
              )}
            </CardHeader>
            <CardContent>
              {measurements && measurements.length > 0 ? (
                <View style={styles.sectionContent}>
                  <View style={styles.twoColumnGrid}>
                    {latestMeasurement?.weight && (
                      <>
                        <Text style={styles.label}>Weight</Text>
                        <Text style={styles.valueText}>
                          {formatWeight(latestMeasurement.weight, unitSystem)}
                        </Text>
                      </>
                    )}
                    {latestMeasurement?.bmi && (
                      <>
                        <Text style={styles.label}>BMI</Text>
                        <Text style={styles.valueText}>
                          {latestMeasurement.bmi}
                        </Text>
                      </>
                    )}
                    {latestMeasurement?.bodyFat && (
                      <>
                        <Text style={styles.label}>Body Fat</Text>
                        <Text style={styles.valueText}>
                          {latestMeasurement.bodyFat}%
                        </Text>
                      </>
                    )}
                    {latestMeasurement?.muscleMass && (
                      <>
                        <Text style={styles.label}>Muscle Mass</Text>
                        <Text style={styles.valueText}>
                          {formatWeight(latestMeasurement.muscleMass, unitSystem)}
                        </Text>
                      </>
                    )}
                    {latestMeasurement?.bmr && (
                      <>
                        <Text style={styles.label}>BMR</Text>
                        <Text style={styles.valueText}>
                          {latestMeasurement.bmr} cal
                        </Text>
                      </>
                    )}
                  </View>
                  {measurements.length > 1 && (
                    <View style={styles.separator}>
                      <Text style={styles.hintText}>
                        {measurements.length - 1} more measurement
                        {measurements.length > 2 ? 's' : ''} available
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.mutedText}>No measurements recorded yet</Text>
                  <Button onPress={() => router.push("./measurements")}>
                    <Text style={[styles.buttonText, {
                      color: "white",

                    }]}>Add First Measurement</Text>
                  </Button>
                </View>
              )}
            </CardContent>
          </Card>

          {/* Blood Test Results Section */}
          {/* <Card style={styles.card}>
            <CardHeader>
              <View style={styles.cardHeaderContent}>
                <View style={styles.cardTitleContainer}>
                  <FontAwesome5 name="file-medical" size={20} color="black" />
                  <CardTitle size={16}>Blood Test Results</CardTitle>
                </View>
                <Button
                  onPress={handleBloodTestUpload}
                  disabled={bloodReportPending}
                >
                  {bloodReportPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Feather size={16} color="white" />
                  )}
                  <Text style={[styles.buttonText, {
                    color: "white",
                  }]}>Upload</Text>
                </Button>
              </View>
            </CardHeader>
            <CardContent style={{ paddingHorizontal: 4 }}>
              {isLoadingBloodTests ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0000ff" />
                </View>
              ) : bloodTestResults && bloodTestResults.length > 0 ? (
                <View style={styles.bloodTestResultsContainer}>
                  {bloodTestResults.map((result: any) => (
                    <View key={result.id} style={styles.bloodTestResultItem}>
                      <View style={styles.bloodTestResultInfo}>
                        <View style={styles.fileIconContainer}>
                          <Feather name="file" size={20} color="#3B82F6" />
                        </View>
                        <View style={styles.fileDetails}>
                          <Text numberOfLines={1} style={styles.fileName}>{result.fileName}</Text>
                          <Text style={styles.fileUploadDate}>
                            {new Date(result.uploadedAt).toLocaleDateString()}
                          </Text>
                          <Badge variant="secondary" style={styles.fileTypeBadge}>
                            {result.fileType === 'application/pdf' ? 'PDF' :
                              result.fileType === 'image/png' ? 'PNG' : 'JPEG'}
                          </Badge>
                        </View>
                      </View>
                      <View style={styles.buttonGroup}>
                        <TouchableOpacity
                          onPress={() => WebBrowser.openBrowserAsync(result?.filePath)}
                          style={{ backgroundColor: "#007BFF", borderRadius: 8, padding: 8, alignItems: 'center', justifyContent: 'center' }}

                        >
                          <Feather name="eye" size={16} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => deleteBloodTestMutation(result.id)}

                          disabled={deleteBRPending}
                          style={{ borderRadius: 8, padding: 8, marginLeft: 12, borderWidth: 1, borderColor: "black", alignItems: 'center', justifyContent: 'center' }}
                        >
                          {deleteBRPending ? (
                            <ActivityIndicator size="small" color="black" />
                          ) : (
                            <Feather name="trash" size={16} color="black" />
                          )}
                        </TouchableOpacity>

                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Feather size={48} color="gray" style={styles.emptyStateIcon} />
                  <Text style={styles.mutedText}>No blood test results uploaded yet</Text>
                  <Text style={styles.hintText}>Upload your blood test results in PDF, PNG, or JPEG format</Text>
                </View>
              )}
            </CardContent>
          </Card> */}

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
    // marginLeft: 64, // Adjust based on sidebar width
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    // marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
  },
  gridContainer: {
    width: '100%'
    // flexDirection: "row",
    // flexWrap: "wrap",
    // justifyContent: "space-between",
  },
  card: {
    width: "100%", // Adjust as needed for spacing
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 16
  },
  cardHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",

  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: '70%'
  },
  buttonGroup: {
    flexDirection: "row",
    // gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,

  },
  buttonText: {
    marginLeft: 4,
    color: "black",
    fontWeight: '600'
  },
  formGrid: {
    // flexDirection: "row",
    // flexWrap: "wrap",
    // justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "gray",
    marginBottom: 6,
  },
  valueText: {
    fontSize: 14,
    marginBottom: 8,
  },
  readOnlyText: {
    fontSize: 14,
    paddingTop: 2,
    color: "gray",
  },
  hintText: {
    fontSize: 10,
    color: "gray",
  },
  sectionContent: {
    marginBottom: 16,
  },
  twoColumnGrid: {
    // flexDirection: "row",
    // justifyContent: "space-between",
    // marginBottom: 8,
    // marginTop: 8,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 8,
    marginTop: 8,
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  mutedText: {
    color: "gray",
    marginBottom: 8,
  },
  bloodTestResultsContainer: {
    marginTop: 16,
  },
  bloodTestResultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    marginBottom: 8,
  },
  bloodTestResultInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fileIconContainer: {
    padding: 8,
    backgroundColor: "#DBEAFE",
    borderRadius: 8,
    marginRight: 16,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  fileUploadDate: {
    fontSize: 12,
    color: "gray",
    marginBottom: 4,
  },
  fileTypeBadge: {
    alignSelf: "flex-start",
  },
});
