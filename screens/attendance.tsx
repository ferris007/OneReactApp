import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Sidebar } from "../components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "../components/ui/Progress";
import { apiRequest } from "../lib/queryClient";
import { Feather } from "@expo/vector-icons";
import {
  startOfMonth,
  endOfMonth,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { useGetAttendance } from "../app/api-calls/Attendance/attendance";

export default function AttendancePage() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const { data: attendance, isLoading } = useGetAttendance()

  const getMonthAttendance = (month: Date) => {
    if (!attendance) return [];
    const start = startOfMonth(month);
    const end = endOfMonth(month);

    return attendance.filter((a) => {
      const date = new Date(a.date);
      return date >= start && date <= end;
    });
  };

  const calculateMonthlyAttendance = (month: Date) => {
    const monthAttendance = getMonthAttendance(month);
    if (!monthAttendance.length) return 0;

    const attended = monthAttendance.filter((a) => a.attended).length;
    return Math.round((attended / monthAttendance.length) * 100);
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const monthlyAttendance = getMonthAttendance(currentMonth);
  const attendanceRate = calculateMonthlyAttendance(currentMonth);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const markedDates = attendance?.reduce((acc: any, curr: any) => {
    const dateString = format(new Date(curr.date), 'yyyy-MM-dd');
    acc[dateString] = {
      selected: true,
      selectedColor: curr.attended ? 'green' : 'red',
      dotColor: curr.attended ? 'green' : 'red',
    };
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.mainContent}>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Sidebar />
          <Text style={styles.title}>Attendance</Text>
        </View>
        <View style={{ flex: 1, height: Dimensions.get("window").height * 0.8, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: "600" }}>Coming Soon</Text>
        </View>

        {/* <View style={styles.gridContainer}>
          <Card style={styles.card}>
            <CardHeader style={styles.cardHeader}>
              <CardTitle>Monthly Attendance</CardTitle>
              <View style={styles.monthNavigation}>
                <Button onPress={previousMonth} variant="outline">
                  <Feather name="chevron-left" size={16} />
                </Button>
                <Text style={styles.monthText}>
                  {format(currentMonth, 'MMMM yyyy')}
                </Text>
                <Button onPress={nextMonth} variant="outline">
                  <Feather name="chevron-right" size={16} />
                </Button>
              </View>
            </CardHeader>
            <CardContent>
              <View style={styles.attendanceSummary}>
                <View style={styles.attendanceRateContainer}>
                  <Text style={styles.attendanceRateLabel}>Attendance Rate</Text>
                  <Text style={styles.attendanceRateValue}>{attendanceRate}%</Text>
                </View>
                <Progress value={attendanceRate} />

                <View style={styles.sessionsSummary}>
                  <Text style={styles.sessionsSummaryTitle}>Sessions Summary</Text>
                  <View style={styles.sessionsSummaryGrid}>
                    <View style={styles.summaryBox}>
                      <Text style={styles.summaryLabel}>Attended</Text>
                      <Text style={styles.summaryValueGreen}>
                        {monthlyAttendance.filter((a) => a.attended).length}
                      </Text>
                    </View>
                    <View style={styles.summaryBox}>
                      <Text style={styles.summaryLabel}>Missed</Text>
                      <Text style={styles.summaryValueRed}>
                        {monthlyAttendance.filter((a) => a.attended === false).length}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>

          <Card style={styles.card}>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                current={format(currentMonth, 'yyyy-MM-dd')}
                onMonthChange={(month: { dateString: string }) => setCurrentMonth(new Date(month.dateString))}
                markedDates={markedDates}
                markingType={'dot'}
              />
            </CardContent>
          </Card>

          <Card style={styles.fullWidthCard}>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Date</Text>
                <Text style={styles.tableHeaderText}>Status</Text>
                <Text style={styles.tableHeaderText}>Notes</Text>
              </View>
              <ScrollView>
                {monthlyAttendance?.length > 0 ? (
                  monthlyAttendance
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record) => (
                      <View key={record.id} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{format(new Date(record.date), 'PPP')}</Text>
                        <View style={styles.tableCell}>
                          {record.attended === true && (
                            <Text style={styles.statusPresent}>Present</Text>
                          )}
                          {record.attended === false && (
                            <Text style={styles.statusAbsent}>Absent</Text>
                          )}
                          {record.attended === null && (
                            <Text style={styles.statusPending}>Pending</Text>
                          )}
                        </View>
                        <Text style={styles.tableCell}>{record.notes || 'No notes'}</Text>
                      </View>
                    ))
                ) : (
                  <View style={styles.noSessionsContainer}>
                    <Text style={styles.noSessionsText}>
                      No sessions scheduled for this month
                    </Text>
                  </View>
                )}
              </ScrollView>
            </CardContent>
          </Card>
        </View> */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    // alignItems: 'center', justifyContent: 'center'
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 12,
  },
  gridContainer: {
    // flexDirection: "row",
    // flexWrap: "wrap",
    // justifyContent: "space-between",
  },
  card: {
    // width: "48%", // Adjust as needed for spacing
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
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  attendanceSummary: {
    marginBottom: 20,
  },
  attendanceRateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  attendanceRateLabel: {
    fontSize: 14,
    color: "gray",
  },
  attendanceRateValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  sessionsSummary: {
    marginTop: 20,
  },
  sessionsSummaryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sessionsSummaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    padding: 15,
    width: "48%",
  },
  summaryLabel: {
    fontSize: 12,
    color: "gray",
  },
  summaryValueGreen: {
    fontSize: 24,
    fontWeight: "bold",
    color: "green",
  },
  summaryValueRed: {
    fontSize: 24,
    fontWeight: "bold",
    color: "red",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  tableHeaderText: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
  },
  statusPresent: {
    backgroundColor: "#D1FAE5",
    color: "green",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "center",
  },
  statusAbsent: {
    backgroundColor: "#FEE2E2",
    color: "red",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "center",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
    color: "orange",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "center",
  },
  noSessionsContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noSessionsText: {
    color: "gray",
  },
});
