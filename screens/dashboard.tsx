import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  TextInput,
  FlatList,
  Keyboard,
} from "react-native";
import { Sidebar } from "../components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { useQuery } from "@tanstack/react-query";
import { User, Measurement, Goal } from "../shared/schema";
import { Button } from "../components/ui/Button";
import { Progress } from "../components/ui/Progress";
import { BlogFeed } from "../components/town-hall/BlogFeed";
import { Chat } from "../components/town-hall/Chat";
import { Feather } from "@expo/vector-icons";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useAuth } from "../app/context/useAuth";
import { BarChart } from "react-native-chart-kit";
import { useGetMeasurements, useGetMyGoals } from "../app/api-calls/FitnessTracking/FitnessTracking";
import MonthlyGoals from "../components/town-hall/MonthlyGoals";
import { useGetChats, useSendMessage } from "../app/api-calls/Chat/chat";
import Toast from "react-native-toast-message";
import { getLocalId } from "../app/api-calls/helper";
import AsyncStorage from "@react-native-async-storage/async-storage";


const screenWidth = Dimensions.get("window").width;

interface Performance {
  metric: string;
  value: string;
  percentComplete: number;
  status: "success" | "warning" | "error";
}

function calculatePerformance(
  measurements: Measurement[],
  goals: Goal[],
): Performance[] {
  if (!measurements.length || !goals?.length) {
    return [];
  }

  const sortedMeasurements = [...measurements].sort((a, b) => {
    const dateA = a?.date ? new Date(a.date) : new Date(0);
    const dateB = b?.date ? new Date(b.date) : new Date(0);

    // Handle invalid dates
    const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
    const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();

    return timeA - timeB;
  });
  const latestMeasurement = sortedMeasurements[sortedMeasurements.length - 1];
  const previousMeasurement =
    sortedMeasurements.length > 1
      ? sortedMeasurements[sortedMeasurements.length - 2]
      : null;

  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const currentGoal = goals?.find((g) => g.month === currentMonth);

  if (!currentGoal || !previousMeasurement) {
    return [];
  }

  const performance: Performance[] = [];

  if (
    currentGoal.weightLoss &&
    previousMeasurement.weight &&
    latestMeasurement.weight
  ) {
    const targetWeight = previousMeasurement.weight - currentGoal.weightLoss;
    const actualWeight = latestMeasurement.weight;
    const weightDifference = previousMeasurement.weight - actualWeight;
    const percentComplete = Math.min(
      100,
      Math.max(0, (weightDifference / currentGoal.weightLoss) * 100)
    );

    let status: "success" | "warning" | "error" = "error";
    if (percentComplete >= 100) {
      status = "success";
    } else if (percentComplete >= 90) {
      status = "warning";
    }

    performance.push({
      metric: "Weight Loss",
      value: `${weightDifference.toFixed(1)} / ${currentGoal.weightLoss} lbs`,
      percentComplete,
      status,
    });
  }

  if (
    currentGoal.muscleGain &&
    previousMeasurement.muscleMass &&
    latestMeasurement.muscleMass
  ) {
    const targetMuscle =
      previousMeasurement.muscleMass + currentGoal.muscleGain;
    const actualMuscle = latestMeasurement.muscleMass;
    const muscleDifference = actualMuscle - previousMeasurement.muscleMass;
    const percentComplete = Math.min(
      100,
      Math.max(0, (muscleDifference / currentGoal.muscleGain) * 100)
    );

    let status: "success" | "warning" | "error" = "error";
    if (percentComplete >= 100) {
      status = "success";
    } else if (percentComplete >= 90) {
      status = "warning";
    }

    performance.push({
      metric: "Muscle Gain",
      value: `${muscleDifference.toFixed(1)} / ${currentGoal.muscleGain} lbs`,
      percentComplete,
      status,
    });
  }

  if (
    currentGoal.bodyFatReduction &&
    previousMeasurement.bodyFat &&
    latestMeasurement.bodyFat
  ) {
    const targetBodyFat =
      previousMeasurement.bodyFat - currentGoal.bodyFatReduction;
    const actualBodyFat = latestMeasurement.bodyFat;
    const bodyFatDifference = previousMeasurement.bodyFat - actualBodyFat;
    const percentComplete = Math.min(
      100,
      Math.max(0, (bodyFatDifference / currentGoal.bodyFatReduction) * 100)
    );

    let status: "success" | "warning" | "error" = "error";
    if (percentComplete >= 100) {
      status = "success";
    } else if (percentComplete >= 90) {
      status = "warning";
    }

    performance.push({
      metric: "Body Fat Reduction",
      value: `${bodyFatDifference.toFixed(1)} / ${currentGoal.bodyFatReduction}%`,
      percentComplete,
      status,
    });
  }

  return performance;
}

export default function Dashboard() {
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuth();
  const { data: measurements } = useGetMeasurements()
  const { data: goals } = useGetMyGoals()

  const performance = calculatePerformance(measurements || [], goals || []);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const { data: messages, isLoading, refetch: refetchChats } = useGetChats()
  const { mutate: sendMessage, isPending } = useSendMessage()




  const sendMessageMutation = (message: string) => {
    let payload = {
      content: message
    }
    sendMessage(payload, {

      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
        setMessage("");
        refetchChats()
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

      },

      onError: (err) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Message not sent"
        })
      }
    })
  }



  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // useEffect(() => {
  //   if (!user) return;
  //   apiRequest("GET", "/api/attendance")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       const map: Record<string, string> = {};
  //       data.forEach((item: any) => {
  //         const date = format(new Date(item.date), "yyyy-MM-dd");
  //         map[date] = item.attended
  //           ? "present"
  //           : item.notes === "excused"
  //             ? "excused"
  //             : "absent";
  //       });
  //       setAttendanceMap(map);
  //     })
  //     .catch((err) => console.error("Failed to fetch attendance", err));
  // }, [user, currentMonth]);



  const onChangeText = (text: string) => {
    setMessage(text)
  }

  function renderContent(content: string) {
    const urlRegex = /(https?:\/\/[^\s]+|\/[^\s]+\.[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
      if (
        part.startsWith("http://") ||
        part.startsWith("https://") ||
        part.startsWith("/")
      ) {
        return (
          <Text
            key={index}
            style={styles.linkText}
            onPress={() => Linking.openURL(part)}
          >
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  }


  const renderItem = ({ item }: any) => {
    console.log("MESSAGE", item);


    return (
      <Card
        key={item?.id}
        style={[
          styles.messageCard,
          item?.userId === user?.id || item?.userId === user?.id ? styles.myMessageCard : styles.otherMessageCard,
        ]}
      >
        <View style={styles.messageHeader}>
          <Text style={styles.username}>{item?.username}</Text>
          <Text style={styles.timestamp}>
            {item.createdAt
              ? format(new Date(item.createdAt), "HH:mm")
              : "Invalid time"}
          </Text>
        </View>
        <Text style={styles.messageContent}>{renderContent(item?.content)}</Text>
      </Card>
    )

  }
  const handleSubmit = () => {
    if (message.trim()) {
      sendMessageMutation(message);
    }
  };


  if (!measurements || !goals) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 5, android: 0 }) ?? 0}
    >
      <SafeAreaView style={styles.container}>
        {/* <ScrollView contentContainerStyle={{ flexGrow: 1 }} scrollEnabled={true} style={styles.mainContent}> */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 16 }}>
          <Sidebar />
          <Text style={styles.title}>ChatRoom</Text>
        </View>
        <View style={{ flex: 1 }}>
          {
            messages && messages?.length === 0 ?
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>No chats found in chat room</Text>
              </View>
              :
              <FlatList
                ref={flatListRef}
                style={{ flex: 1, paddingHorizontal: 16 }}
                contentContainerStyle={{ flexGrow: 1 }}
                data={messages || []}
                renderItem={renderItem}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              // style={{ maxHeight: Dimensions.get("window").height * 0.6 }}
              />
          }
        </View>

        <View style={{ width: "100%", height: 70 }}>
          <View

            style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={(text) => setMessage(text)}
              placeholder="Type your message..."
            />

            <TouchableOpacity onPress={handleSubmit} style={styles.sendButton}>
              {
                isPending ? <ActivityIndicator size={"small"} color={"white"} /> :

                  <Feather name="send" size={12} color="white" />

              }
            </TouchableOpacity>
          </View>
        </View>
        {/* </ScrollView> */}
        {/* <View
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setInputHeight(height);
            console.log("setInputHeight Height:", height);
          }}
          style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={(text) => setMessage(text)}
            placeholder="Type your message..."
          />

          <Button onPress={handleSubmit} style={styles.sendButton}>
            <Feather name="send" size={12} color="white" />
          </Button>
        </View> */}

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // flexDirection: "row",
    backgroundColor: "#F3F4F6",
    padding: 16,

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
    marginLeft: 12
  },
  gridContainer: {
    marginBottom: 16,
    padding: 16,
    // maxHeight: Dimensions.get("window").height * 0.7

  },
  card: {
    marginBottom: 16,
  },
  goalItem: {
    marginBottom: 10,
  },
  goalTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  attendanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: 'center',

  },
  day: {
    width: "13%",
    aspectRatio: 1,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    margin: "0.5%",
    marginHorizontal: "4%",
  },
  dayPresent: {
    backgroundColor: "#D1FAE5",
    width: "13%",
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12
  },
  dayAbsent: {
    backgroundColor: "#FEE2E2",
    width: "13%",
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12
  },
  dayExcused: {
    backgroundColor: "#FEF3C7",
    width: "13%",
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12
  },
  dayDefault: {
    backgroundColor: "#E5E7EB",
    width: "13%",
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    marginHorizontal: 2,
  },
  dayText: {
    fontSize: 12,
  },
  attendanceLink: {
    marginTop: 10,
    alignItems: "center",
    margin: 4,
  },
  attendanceLinkText: {
    color: "gray",
    textDecorationLine: "underline",
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messagesContent: {
    paddingBottom: 10,
  },
  messageCard: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: "80%",
  },
  myMessageCard: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  otherMessageCard: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    alignItems: 'center'
  },
  username: {
    fontWeight: "bold",
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
    marginLeft: 10
  },
  messageContent: {
    fontSize: 14,
  },
  linkText: {
    color: "blue",
    textDecorationLine: "underline",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    paddingVertical: 25,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    alignItems: 'center',
    zIndex: 1,
    // position: 'absolute',
    // bottom: 0,
    // left: 0,
    // right: 0,
    // backgroundColor: 'white'
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    height: '100%'
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',

    // alignItems: 'center',
  },
});