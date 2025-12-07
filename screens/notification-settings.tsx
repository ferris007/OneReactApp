import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import { Sidebar } from "../components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Switch } from "react-native";
import { Label } from "../components/ui/Label";
import { Select } from "../components/ui/Select";
import { TimePicker } from "../components/ui/TimePicker";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../app/context/useAuth";
import * as Location from 'expo-location';

import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useAddNotificationSetting, useGetNotificationSettings, useTestNotification } from "../app/api-calls/Notifications/notifications";
import Toast from "react-native-toast-message";
import { timezones } from "../src/utils/mock";
import RNPickerSelect, { PickerSelectProps } from 'react-native-picker-select';
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserStore } from "../src/utils/zustandStore";
import { useDeleteAccount } from "../app/api-calls/Auth/auth";
import * as iapService from "../hooks/iapService";


interface NotificationSettings {
  dailyRecap: boolean;
  dailyRecapTime: string;
  workoutReminders: boolean;
  timezone: string
  reminderAdvanceTime: string; // e.g., "30min", "1hour", "2hours"
  smsNotifications: boolean;
}

export default function NotificationSettings() {
  const { locationEnabled, coords, startLocationTracking, stopLocationTracking, reset, locationAlreadyEnabled } = useUserStore();

  console.log("locationEnabledlocationEnabledlocationEnabled", locationAlreadyEnabled);


  const pickerRef = useRef<RNPickerSelect>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyRecap: true,
    dailyRecapTime: "19:00", // 7 PM default
    timezone: "America/Toronto",
    workoutReminders: true,
    reminderAdvanceTime: "1hour",
    smsNotifications: true,
  });

  const [location, setLocation] = useState<boolean>(false)
  const [userLocation, setUserLocation] = useState<any>(null)



  const { user, logout } = useAuth();


  const { data: notificationSetting, isLoading, refetch: notiRefetch, isRefetching } = useGetNotificationSettings()
  const { mutate: deleteAccountMutate, isPending: deletionPending, } = useDeleteAccount()
  console.log("notificationSetting", notificationSetting);





  useEffect(() => {
    if (notificationSetting) {
      setSettings(notificationSetting)
    }

  }, [notificationSetting]);

  const { mutate: mutateNotification, isPending } = useAddNotificationSetting()
  const { mutate: testNotification, isPending: testNotPending } = useTestNotification()



  const handleSaveSettings = async () => {
    console.log("SETTINGS", settings);
    let payload = {
      settings: settings
    }
    console.log("PAYLOAD", payload);

    mutateNotification(payload, {

      onSuccess: (res) => {
        console.log("RESSS", res);

        notiRefetch()
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Settings updated"
        })
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error?.message
        })
      },
    })

  };

  const handleTestSMS = async () => {
    let payload = {
      to: user?.phone,
      message: "Hello how are you?"
    }
    testNotification(payload, {
      onSuccess: (res) => {
        console.log("RES", res);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Test sms sent"
        })

      },
      onError: (err) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: err?.message || "Test sms not sent"
        })
        console.log("ERROR", err);

      }
    })

  };
  // useEffect(() => {
  //   notiRefetch()
  // }, [])
  useFocusEffect(
    useCallback(() => {
      notiRefetch()
      getLocationState()
    }, []))


  let locationSubscription: Location.LocationSubscription | null = null;

  const getUserLocation = async () => {

    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log("STATUS", status);

    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Location Permission Denied",
        text2: "Permission to access location was denied",
      });
      return;
    }
    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 100000, // every 5 seconds
        distanceInterval: 20, // or after 10 meters
      },
      (loc) => {
        const lat = loc.coords.latitude;
        const lng = loc.coords.longitude;

        setUserLocation({ lat, lng });
        let locationLatLng = {
          lat: lat,
          lng: lng,
        }

        AsyncStorage.setItem("latLng", JSON.stringify(locationLatLng))
        console.log("Updated Location:", lat, lng);
      }
    );
    if (status === "granted") {
      Toast.show({
        type: "success",
        text2: "Your location will be included in location-based queries.",
        text1: "Location Enabled",
      });
    }
  };

  // Optionally stop tracking when not needed
  const stopUserLocation = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      locationSubscription = null;
    }
  };
  const getLocationState = async () => {
    let value: string | null = await AsyncStorage.getItem("location")
    console.log("VALUE LOCATION", value);

    if (value) {
      setLocation(JSON.parse(value))
    }
  }

  const deleteAccount = async () => {
    logout()
    reset()
    deleteAccountMutate({}, {
      onSuccess: (res) => {
        Toast.show({
          type: "success",
          text1: "Deleted",
          text2: "User deleted successfully"
        })

        router?.replace("/auth")
      }, onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error?.message || error?.response?.message || "Something went wrong"
        })
      }
    })
    // try {
    //   // call your delete API
    //   const res = await fetch("https://your-backend.com/api/user/delete", {
    //     method: "DELETE",
    //     headers: {
    //       "Content-Type": "application/json",
    //       // add auth header if needed, e.g. Authorization: `Bearer ${token}`
    //     },
    //   });
    //   if (!res.ok) {
    //     const body = await res.json();
    //     throw new Error(body?.message || "Delete failed");
    //   }
    //   // success: navigate or show toast
    //   Alert.alert("Deleted", "Your account has been deleted.");
    //   // e.g. navigate to login screen or clear app state
    // } catch (err: any) {
    //   Alert.alert("Delete failed", err.message || "Something went wrong");
    // }
  };
  const confirmDelete = () => {
    Alert.alert(
      "Confirm account deletion",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: deleteAccount,
        },
      ],
      { cancelable: true }
    );
  };





  if (isLoading || isRefetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView style={styles.mainContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Sidebar />
          <Text style={styles.title}>Notification Settings</Text>
        </View>

        <View style={styles.cardContainer}>
          <Card style={styles.card}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                <Feather size={20} color="black" />
                <Text>Daily Recap</Text>
              </CardTitle>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              <View style={styles.settingItem}>
                <View>
                  <Label>Receive Daily Recap</Label>
                  <Text style={styles.mutedText}>
                    Get a summary of your activities, workouts, and nutrition at
                    the end of the day.
                  </Text>
                </View>
                <Switch
                  value={settings?.dailyRecap}
                  onValueChange={(checked) =>
                    setSettings({ ...settings, dailyRecap: checked })
                  }
                />
              </View>

              {settings?.dailyRecap && (
                <>
                  <TouchableOpacity
                    style={{
                      borderColor: 'gray',
                      borderWidth: 1,
                      borderRadius: 8,
                      padding: 10,
                    }}
                    onPress={() => pickerRef.current?.togglePicker()}
                  >
                    <KeyboardAvoidingView>
                      <Select
                        ref={pickerRef}
                        onValueChange={(timezone) =>
                          setSettings({ ...settings, timezone: timezone })
                        }
                        value={settings?.timezone}
                        placeholder={{ label: 'Select Timezone', value: null }}
                        items={timezones}
                        useNativeAndroidPickerStyle={false}
                      // hideIcon={}

                      />
                    </KeyboardAvoidingView>
                  </TouchableOpacity>

                  <View style={styles.timePickerContainer}>
                    <Label>Preferred Time</Label>
                    <View style={styles.timePickerRow}>
                      <Feather size={16} color="gray" />
                      <TimePicker
                        value={settings?.dailyRecapTime || "19:00"}
                        onChange={(time) => setSettings({ ...settings, dailyRecapTime: time })}
                      />
                    </View>
                  </View></>
              )}
            </CardContent>
          </Card>

          <Card style={styles.card}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                <Feather size={20} color="black" />
                <Text>Workout Reminders</Text>
              </CardTitle>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              <View style={styles.settingItem}>
                <View>
                  <Label>Workout Reminders</Label>
                  <Text style={styles.mutedText}>
                    Get reminders before your scheduled workouts.
                  </Text>
                </View>
                <Switch
                  value={settings.workoutReminders}
                  onValueChange={(checked) =>
                    setSettings({ ...settings, workoutReminders: checked })
                  }
                />
              </View>

              {settings.workoutReminders && (
                <View style={styles.selectContainer}>
                  <Label>Remind Me</Label>
                  <Select
                    onValueChange={(value) =>
                      setSettings({ ...settings, reminderAdvanceTime: value })
                    }
                    value={settings?.reminderAdvanceTime}
                    items={[
                      { label: "15 minutes before", value: "15min" },
                      { label: "30 minutes before", value: "30min" },
                      { label: "1 hour before", value: "1hour" },
                      { label: "2 hours before", value: "2hours" },
                      { label: "1 day before", value: "1day" },
                    ]}
                    placeholder={{ label: "Select time", value: null }}
                  />
                </View>
              )}
            </CardContent>
          </Card>

          <Card style={styles.card}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                <Feather size={20} color="black" />
                <Text>SMS Notifications</Text>
              </CardTitle>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              <View style={styles.settingItem}>
                <View>
                  <Label>SMS Notifications</Label>
                  <Text style={styles.mutedText}>
                    Receive notifications via text message to your phone.
                  </Text>
                </View>
                <Switch
                  value={settings.smsNotifications}
                  onValueChange={(checked) =>
                    setSettings({ ...settings, smsNotifications: checked })
                  }
                />
              </View>

              {settings.smsNotifications && (
                <View style={styles.smsInfoContainer}>
                  <Text style={styles.smsInfoText}>
                    Your notifications will be sent to:
                    <Text style={styles.smsPhoneNumber}>
                      {user?.phone || "No phone number found"}
                    </Text>
                  </Text>
                  <Text style={styles.smsHintText}>
                    To update your phone number, please go to your profile
                    settings.
                  </Text>
                </View>
              )}
            </CardContent>
          </Card>
          <Card style={styles.card}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                <Feather size={20} color="black" />
                <Text>Location Enabled</Text>
              </CardTitle>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              <View style={styles.settingItem}>
                <View>
                  <Label>Location</Label>
                  <Text style={styles.mutedText}>
                    Keep Location On to get answers of location based queries
                  </Text>
                </View>
                <Switch
                  value={locationEnabled}
                  onValueChange={async (checked) => {
                    setLocation(checked)
                    if (checked) {
                      startLocationTracking();
                    } else {
                      stopLocationTracking();
                    }
                    // if (!checked) {
                    //   stopUserLocation()
                    //   await AsyncStorage.removeItem("location")
                    //   await AsyncStorage.removeItem("latLng")

                    // } else {
                    //   getUserLocation()
                    // }





                    // AsyncStorage.setItem("location", JSON.stringify(checked))
                  }}
                />
              </View>

            </CardContent>
          </Card>
          <Card style={styles.card}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                <Feather size={20} color="black" />
                <Text>Subscription</Text>
              </CardTitle>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              <Button
                style={{ backgroundColor: undefined, borderWidth: 1, borderColor: "red" }}
                onPress={async () => {
                  try {
                    await iapService.openManageSubscriptions();
                  } catch (err) {
                    Alert.alert('Error', 'Unable to open subscriptions management.');
                  }
                }}
              >
                <Text style={{ color: "red" }}>Cancel Subscription</Text>
              </Button>
            </CardContent>
          </Card>

          <View style={styles.buttonGroup}>
            <Button
              onPress={confirmDelete}
              style={[styles.testSmsButton, {
                borderColor: "red"
              }]}
            >
              <FontAwesome5
                name={"trash"}
                size={14}
                color={"red"}
              />
              <Text style={[styles.testSmsButtonText, {
                color: "red"
              }]}>  Delete Account</Text>
            </Button>
            <Button
              onPress={handleTestSMS}
              style={styles.testSmsButton}
            >
              <Text style={styles.testSmsButtonText}>📱 Test SMS Notifications</Text>
            </Button>
            <Button
              onPress={handleSaveSettings}
              disabled={isPending}
              style={styles.saveSettingsButton}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveSettingsButtonText}>Save Settings</Text>
              )}
            </Button>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 12
  },
  cardContainer: {
    // Styles for the container holding all cards
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardContent: {
    paddingTop: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  mutedText: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
    maxWidth: "90%"
  },
  timePickerContainer: {
    marginTop: 10,
  },
  timePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 5,
  },
  selectContainer: {
    marginTop: 10,
  },
  smsInfoContainer: {
    marginTop: 15,
  },
  smsInfoText: {
    fontSize: 14,
  },
  smsPhoneNumber: {
    fontWeight: "bold",
    marginLeft: 5,
  },
  smsHintText: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },
  buttonGroup: {
    marginTop: 20,
  },
  testSmsButton: {
    backgroundColor: "transparent",
    borderColor: "#2563EB",
    borderWidth: 1,
    marginBottom: 10,
  },
  testSmsButtonText: {
    color: "#2563EB",
    fontWeight: "bold",
  },
  saveSettingsButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveSettingsButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
