import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Sidebar } from "../../components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Checkbox } from "../../components/ui/Checkbox";
import { Textarea } from "../../components/ui/Textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { useToast } from "../../hooks/use-toast";
import {
  User,
  Measurement,
  Goal,
  Attendance,
  MealPlan,
  Workout,
  FoodLog,
  Activity,
} from "../../shared/schema";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { Calendar, DateData } from "react-native-calendars";
import { format } from "date-fns";
import { FileUpload } from "../../components/ui/FileUpload";
import { validateFile, uploadFile } from "../../lib/upload-helpers";
import { Select } from "../../components/ui/Select";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from 'expo-web-browser';
import { useQuery, useMutation } from "@tanstack/react-query";

interface ClientFormData {
  username: string;
  password?: string;
  name: string;
  email: string;
  phone: string;

  nutritionRating?: number;
  dailyDiet?: string;
  waterIntake?: string;
  coffeeDrinker?: boolean;
  coffeeCupsPerDay?: number;
  alcoholDrinker?: boolean;
  alcoholPerWeek?: string;
  smoker?: boolean;
  smokingFrequency?: string;
  dietType?: string;
  dietaryRestrictions?: string;
  medicationsSupplements?: string;

  injuries?: string;
  hadSurgery?: boolean;
  surgeryDate?: string;

  currentExercises?: string;
  personalRecords?: string;
  fitnessLevel?: string;

  stressLevel?: number;
  stressPains?: boolean;
  stressEater?: boolean;

  sleepHours?: number;
  teethGrinding?: boolean;

  playedSports?: string;

  height?: string;
  weight?: string;

  fitnessGoals?: string;

  notes?: string;
}

export default function ClientsPage() {
  const { toast } = useToast();
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isViewClientOpen, setIsViewClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [localMeasurements, setLocalMeasurements] = useState<Measurement[]>([]);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [resetPasswordClient, setResetPasswordClient] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const { data: clients, isLoading } = useQuery<User[]>({
    queryKey: ["/api/clients"],
  });

  const { data: measurements } = useQuery<Measurement[]>({
  queryKey: ["/api/mobile/measurements", selectedClient?.id],
  enabled: Boolean(selectedClient?.id && activeTab === "measurements"),
});

useEffect(() => {
  if (measurements) {
    setLocalMeasurements(measurements);
  }
}, [measurements]);
  

  const { data: attendance } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance", selectedClient?.id],
    enabled: Boolean(selectedClient?.id && activeTab === "attendance"),
  });

  const { data: mealPlans } = useQuery<MealPlan[]>({
    queryKey: ["/api/meal-plans", selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return [];
      const res = await apiRequest("GET", `/api/meal-plans/${selectedClient.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch meal plans");
      }
      return res.json();
    },
    enabled: Boolean(selectedClient?.id && activeTab === "meal-plans"),
  });

  const { data: workouts } = useQuery<Workout[]>({
    queryKey: ["/api/workouts", selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return [];
      const res = await apiRequest("GET", `/api/workouts/${selectedClient.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch workouts");
      }
      return res.json();
    },
    enabled: Boolean(selectedClient?.id && activeTab === "workouts"),
  });

  const { data: foodLogs } = useQuery<FoodLog[]>({
    queryKey: ["/api/food-logs", selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return [];
      const res = await apiRequest("GET", `/api/food-logs/${selectedClient.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch food logs");
      }
      return res.json();
    },
    enabled: Boolean(selectedClient?.id && activeTab === "food-logs"),
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities", selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return [];
      const res = await apiRequest("GET", `/api/activities/${selectedClient.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch activities");
      }
      return res.json();
    },
    enabled: Boolean(selectedClient?.id && activeTab === "activities"),
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const res = await apiRequest("POST", "/api/register", {
        ...data,
        role: "client",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsAddClientOpen(false);
      toast({
        title: "Success",
        description: "Client created successfully",
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<User> }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/users/${data.id}`,
        data.updates,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setSelectedClient(null);
      setIsEditMode(false);
      toast({
        title: "Success",
        description: "Client updated successfully",
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: "Client deleted successfully",
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { id: number; password: string }) => {
      const res = await apiRequest("POST", `/api/admin/users/${data.id}/reset-password`, {
        password: data.password,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password reset successfully",
        variant: 'default',
      });
      setIsPasswordResetOpen(false);
      setNewPassword("");
      setResetPasswordClient(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addMeasurementMutation = useMutation({
    mutationFn: async (data: {
      userId: number;
      measurement: Partial<Measurement>;
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/mobile/measurements/${data.userId}`,
        data.measurement,
      );
      return res.json();
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/mobile/measurements", selectedClient?.id],
      });

      if (selectedClient) {
        try {
          const res = await apiRequest("GET", `/api/mobile/measurements/${selectedClient.id}`);
          if (res.ok) {
            const updatedMeasurements = await res.json();
            setLocalMeasurements(updatedMeasurements);
            queryClient.setQueryData(
              ["/api/mobile/measurements", selectedClient.id],
              updatedMeasurements,
            );
          } else {
            console.error("Failed to fetch measurements:", await res.text());
          }
        } catch (error) {
          console.error("Error fetching measurements:", error);
        }
      }

      toast({
        title: "Success",
        description: "Measurement recorded successfully",
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record measurement",
        variant: "destructive",
      });
    },
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (data: {
      userId: number;
      attendance: Partial<Attendance>;
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/attendance/${data.userId}`,
        data.attendance,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/attendance", selectedClient?.id],
      });
      toast({
        title: "Success",
        description: "Attendance marked successfully",
        variant: 'default',
      });
    },
  });

  const uploadMealPlanMutation = useMutation({
    mutationFn: async (data: { userId: number; file: any }) => {
      const allowedTypes = [".pdf", ".doc", ".docx"];
      const { valid, error } = validateFile(
        data.file,
        allowedTypes,
        5 * 1024 * 1024,
      );

      if (!valid) {
        throw new Error(error || "Invalid file provided.");
      }

      return uploadFile(`/api/meal-plans/${data.userId}`, data.file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/meal-plans", selectedClient?.id],
      });
      toast({
        title: "Success",
        description: "Meal plan uploaded successfully",
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload meal plan",
        variant: "destructive",
      });
    },
  });

  const assignWorkoutMutation = useMutation({
    mutationFn: async (data: { userId: number; workout: Partial<Workout> }) => {
      const res = await apiRequest(
        "POST",
        `/api/workouts/${data.userId}`,
        data.workout,
      );
      if (!res.ok) {
        const error = await res.text();
        throw new Error(`Assignment failed: ${error}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/workouts", selectedClient?.id],
      });
      toast({
        title: "Success",
        description: "Workout assigned successfully",
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign workout",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: ClientFormData) => {
    if (isEditMode && selectedClient) {
      updateClientMutation.mutate({
        id: selectedClient.id,
        updates: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          nutritionRating: data.nutritionRating,
          dailyDiet: data.dailyDiet,
          waterIntake: data.waterIntake,
          coffeeDrinker: data.coffeeDrinker,
          coffeeCupsPerDay: data.coffeeCupsPerDay,
          alcoholDrinker: data.alcoholDrinker,
          alcoholPerWeek: data.alcoholPerWeek,
          smoker: data.smoker,
          smokingFrequency: data.smokingFrequency,
          dietType: data.dietType,
          dietaryRestrictions: data.dietaryRestrictions,
          medicationsSupplements: data.medicationsSupplements,
          injuries: data.injuries,
          hadSurgery: data.hadSurgery,
          surgeryDate: data.surgeryDate,
          currentExercises: data.currentExercises,
          personalRecords: data.personalRecords,
          fitnessLevel: data.fitnessLevel,
          stressLevel: data.stressLevel,
          stressPains: data.stressPains,
          stressEater: data.stressEater,
          sleepHours: data.sleepHours,
          teethGrinding: data.teethGrinding,
          playedSports: data.playedSports,
          height: data.height,
          weight: data.weight,
          fitnessGoals: data.fitnessGoals,
          notes: data.notes,
        },
      });
    } else {
      createClientMutation.mutate(data);
    }
  };

  const handleMeasurementSubmit = async (data: Partial<Measurement>) => {
    if (!selectedClient) return;

    addMeasurementMutation.mutate({
      userId: selectedClient.id,
      measurement: {
        ...data,
        date: new Date().toISOString(),
      },
    });
  };

  const handleAttendanceSubmit = async (
    date: Date,
    status: "present" | "absent" | "excused",
  ) => {
    if (!selectedClient) return;

    markAttendanceMutation.mutate({
      userId: selectedClient.id,
      attendance: {
        date: date.toISOString(),
        attended: status === "present",
        notes: status,
      },
    });
  };

  const handleMealPlanUpload = async (file: any) => {
    if (!selectedClient) {
      toast({
        title: "Upload Error",
        description: "Please select a client first",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadMealPlanMutation.mutateAsync({
        userId: selectedClient.id,
        file,
      });
    } catch (error) {
      console.error("Meal plan upload handler error:", error);
    }
  };

  const handleWorkoutAssign = async (data: { title: string; notes: string; file?: any }) => {
    if (!selectedClient) {
      toast({
        title: "Assignment Error",
        description: "Please select a client first",
        variant: "destructive",
      });
      return;
    }

    try {
      await assignWorkoutMutation.mutateAsync({
        userId: selectedClient.id,
        workout: {
          title: data.title,
          notes: data.notes,
          filePath: data.file ? data.file.uri : undefined,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 1, // TODO: Replace with actual admin user ID
        },
      });
    } catch (error) {
      console.error("Workout assignment handler error:", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const ClientForm = ({ client = null }: { client?: User | null }) => {
    const [formData, setFormData] = useState<ClientFormData>({
      username: client?.username || "",
      name: client?.name || "",
      email: client?.email || "",
      phone: client?.phone || "",
      nutritionRating: client?.nutritionRating || undefined,
      dailyDiet: client?.dailyDiet || "",
      waterIntake: client?.waterIntake || "",
      coffeeDrinker: client?.coffeeDrinker || false,
      coffeeCupsPerDay: client?.coffeeCupsPerDay || undefined,
      alcoholDrinker: client?.alcoholDrinker || false,
      alcoholPerWeek: client?.alcoholPerWeek || "",
      smoker: client?.smoker || false,
      smokingFrequency: client?.smokingFrequency || "",
      dietType: client?.dietType || "",
      dietaryRestrictions: client?.dietaryRestrictions || "",
      medicationsSupplements: client?.medicationsSupplements || "",
      injuries: client?.injuries || "",
      hadSurgery: client?.hadSurgery || false,
      surgeryDate: client?.surgeryDate || "",
      currentExercises: client?.currentExercises || "",
      personalRecords: client?.personalRecords || "",
      fitnessLevel: client?.fitnessLevel || "",
      stressLevel: client?.stressLevel || undefined,
      stressPains: client?.stressPains || false,
      stressEater: client?.stressEater || false,
      sleepHours: client?.sleepHours || undefined,
      teethGrinding: client?.teethGrinding || false,
      playedSports: client?.playedSports || "",
      height: client?.height || "",
      weight: client?.weight || "",
      fitnessGoals: client?.fitnessGoals || "",
      notes: client?.notes || "",
    });

    const handleChange = (field: keyof ClientFormData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    return (
      <ScrollView style={styles.formScrollView}>
        <View style={styles.formSection}>
          <Text style={styles.formSectionTitle}>Account Information</Text>
          {!client && (
            <>
              <View style={styles.formField}>
                <Label>Username</Label>
                <Input
                  value={formData.username}
                  onChangeText={(text) => handleChange("username", text)}
                />
              </View>
              <View style={styles.formField}>
                <Label>Password</Label>
                <Input
                  value={formData.password}
                  onChangeText={(text) => handleChange("password", text)}
                  secureTextEntry
                />
              </View>
            </>
          )}
          <View style={styles.formField}>
            <Label>Full Name</Label>
            <Input
              value={formData.name}
              onChangeText={(text) => handleChange("name", text)}
            />
          </View>
          <View style={styles.formField}>
            <Label>Email</Label>
            <Input
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.formField}>
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChangeText={(text) => handleChange("phone", text)}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <Button onPress={() => handleSubmit(formData)}>
          <Text>{client ? "Update Client" : "Create Client"}</Text>
        </Button>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Sidebar />
      <ScrollView style={styles.mainContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Client Management</Text>
          <Button onPress={() => setIsAddClientOpen(true)}>
            <Feather size={16} color="white" />
            <Text style={styles.buttonText}>Add New Client</Text>
          </Button>
        </View>

        <Card style={styles.clientsCard}>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Name</Text>
              <Text style={styles.tableHeaderText}>Email</Text>
              <Text style={styles.tableHeaderText}>Phone</Text>
              <Text style={styles.tableHeaderText}>Actions</Text>
            </View>
            {clients?.map((client) => (
              <View key={client.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{client.name || client.username}</Text>
                <Text style={styles.tableCell}>{client.email}</Text>
                <Text style={styles.tableCell}>{client.phone || "N/A"}</Text>
                <View style={styles.tableCellActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedClient(client);
                      setIsViewClientOpen(true);
                      setActiveTab("details");
                    }}
                    style={styles.actionButton}
                  >
                    <Feather name="eye" size={16} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedClient(client);
                      setIsEditMode(true);
                      setIsAddClientOpen(true);
                    }}
                    style={styles.actionButton}
                  >
                    <Feather name="edit" size={16} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setResetPasswordClient(client);
                      setIsPasswordResetOpen(true);
                    }}
                    style={styles.actionButton}
                  >
                    <Feather name="key" size={16} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        "Delete Client",
                        "Are you sure you want to delete this client? This action cannot be undone.",
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Delete", onPress: () => deleteClientMutation.mutate(client.id) },
                        ],
                      )
                    }
                    style={styles.actionButton}
                  >
                    <Feather name="trash-2" size={16} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {(!clients || clients.length === 0) && (
              <Text style={styles.noClientsText}>No clients found</Text>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Client Modal */}
        <Modal
          visible={isAddClientOpen}
          onRequestClose={() => setIsAddClientOpen(false)}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isEditMode ? "Edit Client" : "Add New Client"}
              </Text>
              <ClientForm client={isEditMode ? selectedClient : null} />
              <Button onPress={() => setIsAddClientOpen(false)} style={styles.modalCloseButton}>
                <Text style={styles.buttonText}>Close</Text>
              </Button>
            </View>
          </View>
        </Modal>

        {/* View Client Details Modal */}
        <Modal
          visible={isViewClientOpen}
          onRequestClose={() => setIsViewClientOpen(false)}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Client Details</Text>
              {selectedClient && (
                <Tabs
                  defaultValue="details"
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="measurements">Measurements</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="meal-plans">Meal Plans</TabsTrigger>
                    <TabsTrigger value="workouts">Workouts</TabsTrigger>
                    <TabsTrigger value="food-logs">Food Logs</TabsTrigger>
                    <TabsTrigger value="activities">Activities</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details">
                    <ScrollView style={styles.tabContentScrollView}>
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSection}>Basic Information</Text>
                        <Text>Full Name: {selectedClient.name}</Text>
                        <Text>Email: {selectedClient.email}</Text>
                        <Text>Phone: {selectedClient.phone || "N/A"}</Text>
                        <Text>Username: {selectedClient.username}</Text>
                      </View>
                      {/* ... other detail sections ... */}
                    </ScrollView>
                  </TabsContent>

                  <TabsContent value="measurements">
                    <ScrollView style={styles.tabContentScrollView}>
                      <Text style={styles.tabContentTitle}>Measurements</Text>
                      <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Add New Measurement</Text>
                        <View style={styles.formField}>
                          <Label>Weight (lbs)</Label>
                          <Input keyboardType="numeric" onChangeText={(text) => handleMeasurementSubmit({ weight: parseFloat(text) })} />
                        </View>
                        {/* ... other measurement fields ... */}
                        <Button onPress={() => handleMeasurementSubmit({ weight: 0 })}>Record Measurement</Button>
                      </View>
                      <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Measurement History</Text>
                        {localMeasurements.map((m) => (
                          <View key={m.id} style={styles.historyItem}>
                            <Text>{m.date ? new Date(m.date).toLocaleDateString() : 'No Date'}</Text>
                            <Text>{m.weight} lbs</Text>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </TabsContent>

                  <TabsContent value="attendance">
                    <ScrollView style={styles.tabContentScrollView}>
                      <Text style={styles.tabContentTitle}>Attendance</Text>
                      <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Mark Attendance</Text>
                        <Calendar
                          onDayPress={(day: DateData) => setSelectedDate(new Date(day.dateString))}
                          markedDates={selectedDate ? { [format(selectedDate, 'yyyy-MM-dd')]: { selected: true } } : {}}
                        />
                        <Button onPress={() => handleAttendanceSubmit(selectedDate!, "present")}>Mark Present</Button>
                        <Button onPress={() => handleAttendanceSubmit(selectedDate!, "absent")}>Mark Absent</Button>
                      </View>
                      <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Attendance History</Text>
                        {attendance?.map((a) => (
                          <View key={a.id} style={styles.historyItem}>
                            <Text>{new Date(a.date).toLocaleDateString()}</Text>
                            <Text>{a.attended ? "Present" : "Absent"}</Text>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </TabsContent>

                  <TabsContent value="meal-plans">
                    <ScrollView style={styles.tabContentScrollView}>
                      <Text style={styles.tabContentTitle}>Meal Plans</Text>
                      <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Upload Meal Plan</Text>
                        <FileUpload onFileSelect={handleMealPlanUpload} accept=".pdf,.doc,.docx" label="Upload Meal Plan" />
                      </View>
                      <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Assigned Meal Plans</Text>
                        {mealPlans?.map((mp) => (
                          <View key={mp.id} style={styles.historyItem}>
                            <Text>{mp.title || "Meal Plan"}</Text>
                            <TouchableOpacity onPress={() => mp.filePath && WebBrowser.openBrowserAsync(mp.filePath)}>
                              <Text style={styles.linkText}>View</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </TabsContent>

                  <TabsContent value="workouts">
                    <ScrollView style={styles.tabContentScrollView}>
                      <Text style={styles.tabContentTitle}>Workouts</Text>
                      <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Assign Workout</Text>
                        <Label>Title</Label>
                        <Input onChangeText={(text) => handleWorkoutAssign({ title: text, notes: "" })} />
                        <Label>Notes</Label>
                        <Textarea onChangeText={(text) => handleWorkoutAssign({ title: "", notes: text })} />
                        <FileUpload onFileSelect={(file) => handleWorkoutAssign({ title: "", notes: "", file })} accept=".pdf,.doc,.docx,.mp4,.mov" label="Upload Workout File" />
                        <Button onPress={() => handleWorkoutAssign({ title: "Test Workout", notes: "Test Notes" })}>Assign Workout</Button>
                      </View>
                      <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Assigned Workouts</Text>
                        {workouts?.map((w) => (
                          <View key={w.id} style={styles.historyItem}>
                            <Text>{w.title}</Text>
                            <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(w.filePath)}>
                              <Text style={styles.linkText}>View</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </TabsContent>

                  <TabsContent value="food-logs">
                    <ScrollView style={styles.tabContentScrollView}>
                      <Text style={styles.tabContentTitle}>Food Logs</Text>
                      <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Upload Food Log</Text>
                        <FileUpload onFileSelect={(file) => handleMealPlanUpload(file)} accept=".pdf,.png,.jpeg,.jpg" label="Upload Food Log" />
                      </View>
                      <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Food Log History</Text>
                        {foodLogs?.map((fl) => (
                          <View key={fl.id} style={styles.historyItem}>
                            <Text>{new Date(fl.uploadedAt).toLocaleDateString()}</Text>
                            <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(fl.filePath)}>
                              <Text style={styles.linkText}>View</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </TabsContent>

                  <TabsContent value="activities">
                    <ScrollView style={styles.tabContentScrollView}>
                      <Text style={styles.tabContentTitle}>Activities</Text>
                      <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Activities History</Text>
                        {activities?.map((act) => (
                          <View key={act.id} style={styles.historyItem}>
                            <Text>{act.activityType} - {new Date(act.date).toLocaleDateString()}</Text>
                            <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(act.filePath || '')}>
                              <Text style={styles.linkText}>View</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </TabsContent>
                </Tabs>
              )}
              <Button onPress={() => setIsViewClientOpen(false)} style={styles.modalCloseButton}>
                <Text style={styles.buttonText}>Close</Text>
              </Button>
            </View>
          </View>
        </Modal>

        {/* Reset Password Modal */}
        <Modal
          visible={isPasswordResetOpen}
          onRequestClose={() => setIsPasswordResetOpen(false)}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Reset Password for {resetPasswordClient?.username}</Text>
              <View style={styles.formField}>
                <Label>New Password</Label>
                <Input secureTextEntry value={newPassword} onChangeText={setNewPassword} />
              </View>
              <Button onPress={() => resetPasswordMutation.mutate({ id: resetPasswordClient!.id, password: newPassword })}>
                <Text style={styles.buttonText}>Reset Password</Text>
              </Button>
              <Button onPress={() => setIsPasswordResetOpen(false)} style={styles.modalCloseButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Button>
            </View>
          </View>
        </Modal>
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  clientsCard: {
    marginBottom: 24,
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
  tableCellActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    flex: 1,
  },
  actionButton: {
    padding: 5,
  },
  noClientsText: {
    textAlign: "center",
    paddingVertical: 20,
    color: "gray",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  formScrollView: {
    maxHeight: 500,
  },
  formSection: {
    marginBottom: 20,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  formField: {
    marginBottom: 15,
  },
  tabContentScrollView: {
    maxHeight: 400,
  },
  tabContentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  detailSection: {
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  linkText: {
    color: "blue",
    textDecorationLine: "underline",
  },
});
