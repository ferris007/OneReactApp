import React, { useState, useEffect, useMemo } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "../components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Separator } from "../components/ui/Separator";
import { Badge } from "../components/ui/Badge";
import { Select } from "../components/ui/Select";
import { useToast } from "../hooks/use-toast";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { apiRequest } from "../lib/queryClient";
import { useAddMeasurements, useGetMeasurements } from "../app/api-calls/Measurements/measurements";
import Toast from "react-native-toast-message";
import { useBodyMetrics } from "../src/hooks/useBodyMetrics";
import { BodyMetrics } from "../src/metrics/types";
import { useGetTrustedDevices } from "../app/api-calls/Rewards/rewards";

interface LeFuMeasurement {
  weight: number;
  bodyfat: number;
  bmi: number;
  muscleMass: number;
  boneMass: number;
  visceralFat: number;
  totalBodyWater: number;
  bmr: number;
  metabolicAge?: number;
  proteinLevel?: number;
  subcutaneousFat?: number;
  bodyType?: number;
  heartRate?: number;
  cardiacIndex?: number;
  leftArmMuscle?: number;
  rightArmMuscle?: number;
  trunkMuscle?: number;
  leftLegMuscle?: number;
  rightLegMuscle?: number;
  leftArmFat?: number;
  rightArmFat?: number;
  trunkFat?: number;
  leftLegFat?: number;
  rightLegFat?: number;
  deviceName: string;
  source: 'lefu_scale' | 'manual';
}

interface Measurement extends LeFuMeasurement {
  id: string;
  leanBodyMass?: number;
  neck?: number;
  shoulders?: number;
  chest?: number;
  upperArmLeft?: number;
  upperArmRight?: number;
  forearmLeft?: number;
  forearmRight?: number;
  wristLeft?: number;
  wristRight?: number;
  waist?: number;
  hips?: number;
  thighLeft?: number;
  thighRight?: number;
  knees?: number;
  calfLeft?: number;
  calfRight?: number;
  ankleLeft?: number;
  ankleRight?: number;
  triceps?: number;
  biceps?: number;
  subscapular?: number;
  suprailiac?: number;
  midAxillary?: number;
  thigh?: number;
  calf?: number;
  squatMax?: number;
  benchMax?: number;
  deadliftMax?: number;
  pushupCount?: number;
  plankTime?: number;
  verticalJump?: number;
  timestamp: string;
  bodyFat: string
}

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

const convertLength = (
  value: number,
  fromUnit: 'in' | 'cm',
  toUnit: 'in' | 'cm',
): number => {
  if (fromUnit === toUnit) return value;
  if (fromUnit === 'in' && toUnit === 'cm') return value * 2.54;
  if (fromUnit === 'cm' && toUnit === 'in') return value / 2.54;
  return value;
};

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

const formatLength = (
  value: number,
  displaySystem: 'metric' | 'imperial',
): string => {
  if (displaySystem === 'imperial') {
    const inches = convertLength(value, 'cm', 'in');
    return `${inches.toFixed(1)} in`;
  }
  return `${value.toFixed(1)} cm`;
};

export default function MeasurementsPage() {
  const { data: trustedDevices, isLoading: loadingTrustedDevices } = useGetTrustedDevices()
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Measurement>>({});
  const [healthMeasurements, setHealthMeasurements] = useState<Partial<BodyMetrics> | null>(null);
  const { connected, metrics, connect, refresh, setMetricsNull } = useBodyMetrics();

  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('imperial');
  const [lefuStatus, setLefuStatus] = useState<
    'idle' | 'scanning' | 'connecting' | 'measuring' | 'error'
  >('idle');
  const [lefuDevice, setLefuDevice] = useState<string | null>(null);
  const [bluetoothSupported, setBluetoothSupported] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();






  const { mutate: addMeassurements, isPending: measurementsPending } = useAddMeasurements()
  const { data: measurements, isLoading, refetch: refetchMeasurements, isRefetching } = useGetMeasurements()

  console.log("MEASUREMENTS", measurements);





  const saveMeasurementMutation = (data: Partial<Measurement>) => {
    addMeassurements(data, {
      onSuccess: () => {
        refetchMeasurements()
        queryClient.invalidateQueries({ queryKey: ['/api/measurements'] });
        queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
        setShowForm(false);
        setFormData({});
        toast({
          title: "Success",
          description: "Measurements saved successfully!",
          variant: "default",
        });
      },
      onError: (error) => {
        console.log("ERROR", error);

        toast({
          title: "Error",
          description: "Failed to save measurements?. Please try again.",
          variant: "destructive",
        });
      },
    })

  }

  const saveHealthAppMeasurements = async () => {

    // await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("METRICS", metrics);
    let payload
    if (metrics) {


      console.log("NEW DATA", new Date());

      payload = {
        weight: metrics?.weight,
        bodyFat: metrics?.bodyFat,
        bmi: metrics?.bmi,
        muscleMass: metrics?.muscleMass,
        height: metrics?.height,
        date: new Date().toLocaleString()
      }
      console.log(payload);

    }

    try {
      await saveMeasurementMutation(payload)
      setMetricsNull()

    } catch (error) {
      setLefuStatus('error');
      toast({
        title: "Measurement Save Error",
        description: "Failed to save LeFu measurement data",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    if (metrics) {

      setHealthMeasurements(metrics)
    }
  }, [metrics])



  const handleInputChange = (field: keyof Measurement, value: string) => {
    const numValue = parseFloat(value);
    setFormData(prev => ({
      ...prev,
      [field]: isNaN(numValue) ? undefined : numValue
    }));
  };

  const handleSubmit = () => {
    const hasData = Object.values(formData).some(value => value !== undefined && value !== '');
    if (!hasData) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter at least one measurement.",
      });
      return;
    }

    const convertedData = { ...formData };

    if (unitSystem === 'imperial') {
      if (convertedData.weight) {
        convertedData.weight = convertWeight(Number(convertedData.weight), 'lbs', 'kg');
      }
      if (convertedData.muscleMass) {
        convertedData.muscleMass = convertWeight(Number(convertedData.muscleMass), 'lbs', 'kg');
      }
      if (convertedData.squatMax) {
        convertedData.squatMax = convertWeight(Number(convertedData.squatMax), 'lbs', 'kg');
      }
      if (convertedData.benchMax) {
        convertedData.benchMax = convertWeight(Number(convertedData.benchMax), 'lbs', 'kg');
      }
      if (convertedData.deadliftMax) {
        convertedData.deadliftMax = convertWeight(Number(convertedData.deadliftMax), 'lbs', 'kg');
      }
      const circumferenceFields = ['neck', 'chest', 'waist', 'hips', 'upperArmLeft', 'upperArmRight',
        'forearmLeft', 'forearmRight', 'thighLeft', 'thighRight', 'calfLeft', 'calfRight'] as const;
      circumferenceFields.forEach(field => {
        const value = convertedData[field];
        if (typeof value === 'number') {
          convertedData[field] = convertLength(value, 'in', 'cm');
        }
      });
      if (convertedData.verticalJump) {
        convertedData.verticalJump = convertLength(Number(convertedData.verticalJump), 'in', 'cm');
      }
    }

    saveMeasurementMutation(convertedData);
  };

  console.log("metricsmetrics", metrics);

  const checkAll = useMemo(() => {
    if (metrics) {
      const filtered = Object.fromEntries(
        Object.entries(metrics).filter(([_, v]) => v !== null)
      );
      console.log("filteredfiltered", filtered);
      if (Object.keys(filtered).length === 0) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No health metrics found"
        });
        return false
      } else {
        return true
      }
    }

  }, [metrics])
  if (isLoading || isRefetching || measurementsPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }




  < View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }
  }>
    <Sidebar />
    <Text style={styles.title}>Dashboard</Text>
  </View >
  console.log("METRICS", metrics);





  return (
    <SafeAreaView style={styles.container}>

      <ScrollView style={styles.mainContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>

            <Sidebar />

            <View style={{ marginLeft: 12 }}>
              <Text style={styles.title}>Measurements</Text>
              <Text style={styles.subtitle}>Track your body composition</Text>
            </View>
          </View>
          {/* <Button onPress={() => setShowForm(!showForm)} style={styles.addButton}>
            <Feather size={16} color="white" />
            <Text style={styles.buttonText}>{showForm ? 'Cancel' : 'Add'}</Text>
          </Button> */}
        </View>

        <Card style={styles.lefuCard}>
          <CardHeader>
            <View style={styles.lefuCardTitle}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  margin: 0
                }}
              >Connect Health Integration</Text>
              {/* <Badge variant="secondary" style={styles.lefuBadge}>Phase 3 Ready</Badge> */}
              {/* <View style={{ padding: 8, backgroundColor: '#E0E0E0', borderRadius: 16, marginLeft: 8 }}>
                <Text style={{ fontSize: 12 }}>Phase 3 Ready</Text>
              </View> */}
            </View>
            <Text style={styles.lefuDescription}>
              Real-time device communication with Health App
            </Text>
            {/* <View style={styles.lefuCompatibleDevices}>
              <Text style={styles.lefuCompatibleDevicesTitle}>Compatible Devices:</Text>
              <Text style={styles.lefuCompatibleDevicesText}>
                LeFu body composition scales with 8-electrode technology, Bluetooth connectivity, and 58+ body metrics support.
              </Text>
            </View> */}
          </CardHeader>
          <CardContent style={styles.lefuCardContent}>
            {/* <View style={styles.lefuStatusContainer}>
              <View style={styles.lefuStatusTextContainer}>
                <Feather size={16} color="#2563EB" />
                <Text style={styles.lefuStatusText}>
                  {bluetoothSupported ? "Bluetooth Ready" : "Bluetooth Not Supported"}
                </Text>
                {bluetoothSupported ? (
                  <Feather name="check-circle" size={16} color="green" />
                ) : (
                  <Feather name="x-circle" size={16} color="red" />
                )}
              </View>
              <Text style={styles.lefuStatusSubText}>
                {bluetoothSupported
                  ? "Web Bluetooth API ready for device communication"
                  : "Web Bluetooth not supported in this browser"}
              </Text>
            </View> */}
            <Button
              onPress={connect}
              // variant="outline"
              style={styles.lefuButton}
            >
              <Text style={styles.buttonText}>
                {connected ? "Connected to Health App" : "Connect Health App"}
              </Text>
            </Button>

            <View style={styles.lefuDemoContainer}>
              <View style={styles.lefuDemoTextContainer}>
                <Text style={styles.lefuDemoText}>Get Measurement</Text>
              </View>
              <Text style={styles.lefuDemoSubText}>
                Ask Health app for measurements
              </Text>
              <Button
                onPress={refresh}
                // disabled={ }
                style={styles.lefuButton}
              >
                <Text style={styles.buttonText}>Get latest Measurements</Text>
              </Button>
              {

                metrics && checkAll &&
                <>
                  <View style={[styles.measurementGrid, {
                    marginTop: 20
                  }]}>

                    {Object.keys(metrics).map((key) => {
                      return (
                        key === "platform" || key === "measured_at" || key === "source" || metrics[key] === null ? null :
                          <View style={styles.measurementGridItem}>
                            <Text style={styles.measurementLabel}>{key}:  </Text>
                            <Text>{key === "weight" || key === "muscleMass" ? formatWeight(metrics[key], unitSystem) :
                              metrics[key]
                            }</Text>
                          </View>
                      )
                    })}

                  </View>

                  <Button
                    onPress={saveHealthAppMeasurements}
                    disabled={measurementsPending}
                    style={styles.lefuButton}
                  >
                    <Text style={styles.buttonText}>Save Measurements</Text>
                  </Button>
                </>
              }



            </View>

            {lefuStatus === 'measuring' && (
              <View style={styles.lefuMeasuringContainer}>
                <Text style={styles.lefuMeasuringText}>
                  Step on scale and remain still for accurate measurement...
                </Text>
                <View style={styles.progressBar}>
                  <View style={styles.progressBarFill} />
                </View>
              </View>
            )}

            {lefuDevice && lefuStatus === 'idle' && (
              <View style={styles.lefuConnectedContainer}>
                <Feather size={16} color="green" />
                <Text style={styles.lefuConnectedText}>
                  LeFu Scale connected and ready for measurements
                </Text>
              </View>
            )}

            {lefuStatus === 'error' && (
              <View style={styles.lefuErrorContainer}>
                <Feather size={16} color="red" />
                <Text style={styles.lefuErrorText}>
                  Connection failed. Try the troubleshooting steps below.
                </Text>
                <View style={styles.lefuTroubleshooting}>
                  <Text style={styles.lefuTroubleshootingTitle}>Troubleshooting Tips:</Text>
                  <Text style={styles.lefuTroubleshootingText}>
                    • Make sure your LeFu scale is powered on and ready for pairing
                    • Step on the scale briefly to wake it up, then step off
                    • Grant Bluetooth permissions when prompted
                    • Use the "Start Demo" button to test functionality without a physical device
                  </Text>
                </View>
              </View>
            )}
          </CardContent>
        </Card>

        {showForm && (
          <Card style={styles.formCard}>
            <CardHeader>
              <View style={styles.formHeader}>
                <CardTitle size={18}>New Measurement Entry</CardTitle>
                <View style={styles.unitSystemContainer}>
                  <Label style={{ marginBottom: 0 }}>Unit System:</Label>
                  <View style={{ borderColor: "gray", borderWidth: 1, borderRadius: 8, padding: 8, marginLeft: 16 }}>

                    <Select
                      onValueChange={(value: 'metric' | 'imperial') => setUnitSystem(value)}

                      value={unitSystem}
                      placeholder={{ label: 'Select unit', value: null }}
                      items={[
                        { label: 'Imperial', value: 'imperial' },
                        { label: 'Metric', value: 'metric' },
                      ]}
                      useNativeAndroidPickerStyle={false}
                    // hideIcon={true}

                    />
                  </View>
                  <Text style={styles.unitSystemText}>
                    {unitSystem === 'imperial' ? 'lbs, inches' : 'kg, cm'}
                  </Text>
                </View>
              </View>
            </CardHeader>
            <CardContent style={styles.formContent}>
              <View>
                <Text style={styles.sectionTitle}>Body Composition</Text>
                <View style={styles.formGrid}>
                  <View style={{ width: "30%", marginBottom: 10 }}>
                    <Label>Weight ({unitSystem === 'imperial' ? 'lbs' : 'kg'})</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.weight?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("weight", text)}
                    />
                  </View>
                  <View style={{ width: "30%", marginBottom: 10 }}>

                    <Label>Body Fat %</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.bodyfat?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("bodyfat", text)}
                    />
                  </View>
                  <View style={{ width: "30%", marginBottom: 10 }}>

                    <Label>BMI</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.bmi?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("bmi", text)}
                    />
                  </View>
                  <View style={{ width: "30%", marginBottom: 10 }}>

                    <Label>Muscle Mass ({unitSystem === 'imperial' ? 'lbs' : 'kg'})</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.muscleMass?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("muscleMass", text)}
                    />
                  </View>
                  <View style={{ width: "30%", marginBottom: 10 }}>

                    <Label>Total Body Water %</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.totalBodyWater?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("totalBodyWater", text)}
                    />
                  </View>
                  <View style={{ width: "30%", marginBottom: 10 }}>

                    <Label>BMR (calories)</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.bmr?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("bmr", text)}
                    />
                  </View>
                </View>
              </View>

              <Separator />

              <View>
                <Text style={styles.sectionTitle}>Key Circumferences ({unitSystem === 'imperial' ? 'inches' : 'cm'})</Text>
                <View style={styles.formGrid}>
                  <View style={{ width: "30%", marginBottom: 10 }}>

                    <Label>Neck</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.neck?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("neck", text)}
                    />
                  </View>
                  <View style={{ width: "30%", marginBottom: 10 }}>

                    <Label>Chest</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.chest?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("chest", text)}
                    />
                  </View>
                  <View style={{ width: "30%", marginBottom: 10 }}>

                    <Label>Waist</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.waist?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("waist", text)}
                    />
                  </View>
                  <View style={{ width: "30%", marginBottom: 10 }}>

                    <Label>Hips/Glutes</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.hips?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("hips", text)}
                    />
                  </View>
                  <View style={{ width: "30%", marginBottom: 10 }}>
                    <Label>Upper Arm</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.upperArmLeft?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("upperArmLeft", text)}
                    />
                  </View>
                  <View style={{ width: "30%", marginBottom: 10 }}>

                    <Label>Thigh (Left)</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.thighLeft?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("thighLeft", text)}
                    />
                  </View>
                </View>
              </View>

              <Separator />

              <View>
                <Text style={styles.sectionTitle}>Strength & Performance</Text>
                <View style={styles.formGrid}>
                  <View style={{ marginBottom: 10 }}>
                    <Label>Squat 1-Rep Max ({unitSystem === 'imperial' ? 'lbs' : 'kg'})</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.squatMax?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("squatMax", text)}
                    />
                  </View>
                  <View style={{ marginBottom: 10 }}>

                    <Label>Bench Press 1-Rep Max ({unitSystem === 'imperial' ? 'lbs' : 'kg'})</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.benchMax?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("benchMax", text)}
                    />
                  </View>
                  <View style={{ marginBottom: 10 }}>

                    <Label>Deadlift 1-Rep Max ({unitSystem === 'imperial' ? 'lbs' : 'kg'})</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.deadliftMax?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("deadliftMax", text)}
                    />
                  </View>
                  <View style={{ marginBottom: 10 }}>

                    <Label>Push-ups/minute</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.pushupCount?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("pushupCount", text)}
                    />
                  </View>
                  <View style={{ marginBottom: 10 }}>

                    <Label>Plank Hold (seconds)</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.plankTime?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("plankTime", text)}
                    />
                  </View>
                  <View style={{ marginBottom: 10 }}>

                    <Label>Vertical Jump ({unitSystem === 'imperial' ? 'inches' : 'cm'})</Label>
                    <Input
                      keyboardType="numeric"
                      value={formData.verticalJump?.toString() || ''}
                      onChangeText={(text: string) => handleInputChange("verticalJump", text)}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.formButtons}>
                <Button
                  onPress={handleSubmit}
                  disabled={measurementsPending}
                  style={styles.saveButton}
                >
                  <Text style={styles.buttonText}>
                    {measurementsPending ? "Saving..." : "Save Measurements"}
                  </Text>
                </Button>
                <Button onPress={() => setShowForm(false)} variant="outline">
                  <Text style={[styles.buttonText, {
                    color: "black"
                  }]}>Cancel</Text>
                </Button>
              </View>
            </CardContent>
          </Card>
        )}

        <Card style={styles.historyCard}>
          <CardHeader>
            <View style={styles.historyHeader}>
              <CardTitle>Measurement History</CardTitle>
              <Text style={styles.unitSystemDisplay}>
                Displaying in {unitSystem === 'imperial' ? 'Imperial (lbs, inches)' : 'Metric (kg, cm)'}
              </Text>
            </View>
          </CardHeader>
          <CardContent>
            {measurements && measurements?.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                {/* <Ionicons name="NotFound" size={48} color="gray" style={styles.emptyStateIcon} /> */}
                <Text style={styles.emptyStateText}>No measurements recorded yet</Text>
                <Text style={styles.emptyStateSubText}>Add your first measurement to start tracking progress</Text>
              </View>
            ) : (
              <View style={styles.measurementsList}>
                {measurements?.map((measurement: Measurement) => (
                  <View key={measurement.id} style={styles.measurementItem}>
                    <View style={styles.measurementItemHeader}>
                      <Text style={styles.measurementDate}>
                        {measurement.timestamp ? format(new Date(measurement.timestamp), "MMMM d, yyyy") : "Recent"}
                      </Text>
                      <Text style={styles.measurementTime}>
                        {measurement.timestamp ? format(new Date(measurement.timestamp), "h:mm a") : ""}
                      </Text>
                    </View>
                    {measurement.source === 'lefu_scale' && (
                      <View style={styles.lefuSourceBadgeContainer}>
                        <Badge variant="outline" style={styles.lefuSourceBadge}>
                          <Ionicons size={12} color="black" />
                          <Text style={styles.lefuSourceBadgeText}>LeFu Scale</Text>
                        </Badge>
                        <Text style={styles.lefuSourceDeviceName}>{measurement.deviceName}</Text>
                      </View>
                    )}

                    <View style={styles.measurementGrid}>
                      {measurement.weight && (
                        <View style={styles.measurementGridItem}>
                          <Text style={styles.measurementLabel}>Weight:</Text>
                          <Text>{formatWeight(measurement.weight, unitSystem)}</Text>
                        </View>
                      )}
                      {measurement?.bodyFat && (
                        <View style={styles.measurementGridItem}>
                          <Text style={styles.measurementLabel}>Body Fat:</Text>
                          <Text>{measurement.bodyFat}%</Text>
                        </View>
                      )}
                      {measurement.bmi && (
                        <View style={styles.measurementGridItem}>
                          <Text style={styles.measurementLabel}>BMI:</Text>
                          <Text>{measurement.bmi}</Text>
                        </View>
                      )}
                      {measurement.muscleMass && (
                        <View style={styles.measurementGridItem}>
                          <Text style={styles.measurementLabel}>Muscle Mass:</Text>
                          <Text>{formatWeight(measurement.muscleMass, unitSystem)}</Text>
                        </View>
                      )}
                      {measurement?.height && (
                        <View style={styles.measurementGridItem}>
                          <Text style={styles.measurementLabel}>Height:</Text>
                          <Text>{(measurement?.height)}</Text>
                        </View>
                      )}
                      {measurement.visceralFat && (
                        <View style={styles.measurementGridItem}>
                          <Text style={styles.measurementLabel}>Visceral Fat:</Text>
                          <Text>{measurement.visceralFat}</Text>
                        </View>
                      )}
                      {measurement.totalBodyWater && (
                        <View style={styles.measurementGridItem}>
                          <Text style={styles.measurementLabel}>Body Water:</Text>
                          <Text>{measurement.totalBodyWater}%</Text>
                        </View>
                      )}
                      {measurement.bmr && (
                        <View style={styles.measurementGridItem}>
                          <Text style={styles.measurementLabel}>BMR:</Text>
                          <Text>{measurement.bmr} cal</Text>
                        </View>
                      )}
                      {measurement.metabolicAge && (
                        <View style={styles.measurementGridItem}>
                          <Text style={styles.measurementLabel}>Metabolic Age:</Text>
                          <Text>{measurement.metabolicAge} yrs</Text>
                        </View>
                      )}
                    </View>

                    {measurement.source === 'lefu_scale' && (measurement.leftArmMuscle || measurement.leftArmFat) && (
                      <View style={styles.segmentalAnalysisContainer}>
                        <Text style={styles.segmentalAnalysisTitle}>
                          <Feather size={16} color="black" />
                          <Text>Segmental Analysis</Text>
                        </Text>
                        <View style={styles.segmentalAnalysisGrid}>
                          {(measurement.leftArmMuscle || measurement.rightArmMuscle || measurement.trunkMuscle) && (
                            <View style={styles.segmentalAnalysisColumn}>
                              <Text style={styles.segmentalAnalysisColumnTitle}>MUSCLE MASS (kg)</Text>
                              {measurement.leftArmMuscle && (
                                <View style={styles.segmentalAnalysisItem}>
                                  <Text>Left Arm:</Text>
                                  <Text>{measurement.leftArmMuscle}</Text>
                                </View>
                              )}
                              {measurement.rightArmMuscle && (
                                <View style={styles.segmentalAnalysisItem}>
                                  <Text>Right Arm:</Text>
                                  <Text>{measurement.rightArmMuscle}</Text>
                                </View>
                              )}
                              {measurement.trunkMuscle && (
                                <View style={styles.segmentalAnalysisItem}>
                                  <Text>Trunk:</Text>
                                  <Text>{measurement.trunkMuscle}</Text>
                                </View>
                              )}
                              {measurement.leftLegMuscle && (
                                <View style={styles.segmentalAnalysisItem}>
                                  <Text>Left Leg:</Text>
                                  <Text>{measurement.leftLegMuscle}</Text>
                                </View>
                              )}
                              {measurement.rightLegMuscle && (
                                <View style={styles.segmentalAnalysisItem}>
                                  <Text>Right Leg:</Text>
                                  <Text>{measurement.rightLegMuscle}</Text>
                                </View>
                              )}
                            </View>
                          )}

                          {(measurement.leftArmFat || measurement.rightArmFat || measurement.trunkFat) && (
                            <View style={styles.segmentalAnalysisColumn}>
                              <Text style={styles.segmentalAnalysisColumnTitle}>FAT MASS (kg)</Text>
                              {measurement.leftArmFat && (
                                <View style={styles.segmentalAnalysisItem}>
                                  <Text>Left Arm:</Text>
                                  <Text>{measurement.leftArmFat}</Text>
                                </View>
                              )}
                              {measurement.rightArmFat && (
                                <View style={styles.segmentalAnalysisItem}>
                                  <Text>Right Arm:</Text>
                                  <Text>{measurement.rightArmFat}</Text>
                                </View>
                              )}
                              {measurement.trunkFat && (
                                <View style={styles.segmentalAnalysisItem}>
                                  <Text>Trunk:</Text>
                                  <Text>{measurement.trunkFat}</Text>
                                </View>
                              )}
                              {measurement.leftLegFat && (
                                <View style={styles.segmentalAnalysisItem}>
                                  <Text>Left Leg:</Text>
                                  <Text>{measurement.leftLegFat}</Text>
                                </View>
                              )}
                              {measurement.rightLegFat && (
                                <View style={styles.segmentalAnalysisItem}>
                                  <Text>Right Leg:</Text>
                                  <Text>{measurement.rightLegFat}</Text>
                                </View>
                              )}
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )
            }
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView >
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  buttonText: {
    color: "white",
  },
  lefuCard: {
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    marginBottom: 24,
  },
  lefuCardTitle: {
    flexDirection: "row",
    alignItems: "center",
    // gap: 10,

  },
  lefuBadge: {
    marginLeft: 10,
  },
  lefuDescription: {
    fontSize: 14,
    color: "gray",
    marginTop: 5,
  },
  lefuCompatibleDevices: {
    backgroundColor: "#E0F2FE",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  lefuCompatibleDevicesTitle: {
    fontWeight: "bold",
    color: "#1D4ED8",
    marginBottom: 5,
  },
  lefuCompatibleDevicesText: {
    color: "#1E40AF",
    fontSize: 12,
  },
  lefuCardContent: {
    paddingTop: 10,
  },
  lefuStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  lefuStatusTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  lefuStatusText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  lefuStatusSubText: {
    fontSize: 12,
    color: "gray",
    flex: 1,
    left: 10
  },
  lefuButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  lefuDemoContainer: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "white",
    marginTop: 20,
  },
  lefuDemoTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  lefuDemoText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  lefuDemoSubText: {
    fontSize: 12,
    color: "gray",
    marginBottom: 10,
  },
  lefuMeasuringContainer: {
    marginTop: 15,
  },
  lefuMeasuringText: {
    fontSize: 12,
    color: "gray",
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
  },
  progressBarFill: {
    width: "60%", // Example progress
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 4,
  },
  lefuConnectedContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 15,
  },
  lefuConnectedText: {
    color: "green",
    fontSize: 14,
  },
  lefuErrorContainer: {
    marginTop: 15,
  },
  lefuErrorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  lefuTroubleshooting: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  lefuTroubleshootingTitle: {
    fontWeight: "bold",
    color: "#DC2626",
    marginBottom: 5,
  },
  lefuTroubleshootingText: {
    color: "#B91C1C",
    fontSize: 12,
  },
  formCard: {
    marginBottom: 24,
  },
  formHeader: {
    // flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
  },
  unitSystemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  unitSystemText: {
    fontSize: 14,
    color: "gray",
    marginLeft: 10,
  },
  formContent: {
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  formButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
  },
  historyCard: {
    marginBottom: 24,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unitSystemDisplay: {
    fontSize: 12,
    color: "gray",
  },
  emptyStateContainer: {
    alignItems: "center",
    // paddingVertical: 40,
    justifyContent: 'center'
  },
  emptyStateIcon: {
    // marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "gray",
    marginBottom: 5,
  },
  emptyStateSubText: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
  },
  measurementsList: {
    marginTop: 10,
  },
  measurementItem: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  measurementItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  measurementDate: {
    fontWeight: "bold",
  },
  measurementTime: {
    fontSize: 12,
    color: "gray",
  },
  lefuSourceBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  lefuSourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#E0F2FE",
    borderColor: "#BFDBFE",
  },
  lefuSourceBadgeText: {
    fontSize: 12,
    color: "#1D4ED8",
  },
  lefuSourceDeviceName: {
    fontSize: 12,
    color: "gray",
    marginLeft: 10,
  },
  measurementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  measurementGridItem: {
    width: "48%",
    marginBottom: 10,
  },
  measurementLabel: {
    color: "gray",
  },
  segmentalAnalysisContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  segmentalAnalysisTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  segmentalAnalysisGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  segmentalAnalysisColumn: {
    width: "48%",
  },
  segmentalAnalysisColumnTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "gray",
    marginBottom: 5,
  },
  segmentalAnalysisItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
});
