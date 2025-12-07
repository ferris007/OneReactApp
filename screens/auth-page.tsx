import React, { useState, useEffect } from "react";
// import { useAuth } from '../hooks/use-auth';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertUserSchema,
  registrationSchema,
  RegistrationFormData,
} from "../shared/schema";
import { useRouter } from "expo-router";
import * as z from "zod";
import Toast from 'react-native-toast-message';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/Form";
import { Input } from "../components/ui/Input";
import * as iapService from "../hooks/iapService";

import { Button } from "../components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/Card";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Checkbox } from "../components/ui/Checkbox";
import { pickerSelectStyles, Select } from "../components/ui/Select";
import IncrementInput from "../components/IncrementInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken, isValidUSZipCode } from "../app/api-calls/helper";
import { useLogin, useRegister, useUserDetails } from "../app/api-calls/Auth/auth";
import { AGENT_BASE_URL, AUTH_KEY } from "../app/api-calls/variables";
import { useAuth } from "../app/context/useAuth";

export default function AuthPage() {
  // const { user, loginMutation, registerMutation } = useAuth();

  const { user, login, } = useAuth()
  const { mutate: loginFun, isPending } = useLogin();
  const { mutate: registerFun, isPending: isPendingRegister } = useRegister();
  const { data, refetch, isRefetching } = useUserDetails()
  const router = useRouter();
  const [formStep, setFormStep] = useState(0);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("login");
  const [resendVerification, setResendVerification] = useState<string | null>(null);

  const formSteps = [
    { name: "Account", icon: <Feather name="user" size={16} /> },
    { name: "Nutrition", icon: <FontAwesome5 name="utensils" size={16} /> },
    { name: "Injuries", icon: <Ionicons name="medkit-outline" size={16} /> },
    { name: "Exercise", icon: <Ionicons name="barbell-outline" size={16} /> },
    { name: "Stress", icon: <Ionicons name="sad-outline" size={16} /> },
    { name: "Sleep", icon: <Ionicons name="moon-outline" size={16} /> },
    { name: "Sports", icon: <Ionicons name="football-outline" size={16} /> },
    { name: "Measurements", icon: <FontAwesome5 name="ruler-combined" size={16} /> },
    { name: "Goals", icon: <FontAwesome5 name="bullseye" size={16} /> },
  ];

  type LoginFormData = {
    username: string;
    password: string;
  };

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(
      insertUserSchema.pick({ username: true, password: true })
    ),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registrationDefaultValues: RegistrationFormData = {
    role: "client",
    nutritionRating: 5,
    coffeeDrinker: false,
    coffeeCupsPerDay: 0,
    alcoholDrinker: false,
    alcoholPerWeek: "",
    smoker: false,
    smokingFrequency: "",
    hadSurgery: false,
    surgeryDate: "",
    stressLevel: 5,
    stressPains: false,
    stressEater: false,
    sleepHours: 7,
    teethGrinding: false,
    dietType: "Meat Eater",
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    currentExercises: "",
    personalRecords: "",
    fitnessLevel: "",
    dailyDiet: "",
    dietaryRestrictions: "",
    medicationsSupplements: "",
    fitnessGoals: "",
    waterIntake: "",
    zip_code: ""
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    reset,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: registrationDefaultValues,
  });

  const nextStep = () => {
    const fields = getFieldsForStep(formStep);
    const values = getValues();

    // Filter out only the values relevant to this step
    const stepValues = fields.reduce((acc, key) => {
      (acc as any)[key] = (values as any)[key];
      return acc;
    }, {} as Partial<RegistrationFormData>);

    if (formStep === 0) {

      if (((stepValues.username?.length ?? 0) < 3 || (stepValues.username?.length ?? 0) > 50)) {
        Toast.show({
          type: "error",
          text1: "Invalid Username",
          text2: "Username must be between 3 and 50 characters.",
        });
        return;
      }
      if (stepValues?.username?.includes(" ")) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Username should not contain space."
        })
        return
      }
      if (((stepValues.name?.length ?? 0) < 3 || (stepValues.name?.length ?? 0) > 50)) {
        Toast.show({
          type: "error",
          text1: "Invalid Username",
          text2: "Username must be between 3 and 50 characters.",
        });
        return;
      }

      if ((stepValues?.password?.length ?? 0) < 6) {
        Toast.show({
          type: "error",
          text1: "Invalid Password",
          text2: "Password must be at least 6 characters.",
        });
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stepValues?.email ?? '')) {
        Toast.show({
          type: "error",
          text1: "Invalid Email",
          text2: "Email must be a valid email address.",
        });
        return;
      }
      console.log("STEP VALUES", stepValues);

      if (stepValues?.zip_code && stepValues?.zip_code !== "" && stepValues?.zip_code?.length > 0) {
        let checkValidZipCode = isValidUSZipCode(stepValues?.zip_code)
        console.log("CHECK VALID", checkValidZipCode);

        if (!checkValidZipCode) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Please enter valid US zip code"
          })
          return
        }


      }

      setFormStep((prev) => prev + 1);

    } else {
      setFormStep((prev) => prev + 1);

    }
  };

  const prevStep = () => {
    setFormStep((prev) => prev - 1);
  };

  const getFieldsForStep = (step: number): (keyof RegistrationFormData)[] => {
    switch (step) {
      case 0:
        return ["username", "password", "name", "email", "phone", "zip_code"];
      case 1:
        return [
          "nutritionRating",
          "dailyDiet",
          "waterIntake",
          "coffeeDrinker",
          "coffeeCupsPerDay",
          "alcoholDrinker",
          "alcoholPerWeek",
          "smoker",
          "smokingFrequency",
          "dietType",
          "dietaryRestrictions",
          "medicationsSupplements",
        ];
      case 2:
        return ["injuries", "hadSurgery", "surgeryDate"];
      case 3:
        return ["currentExercises", "personalRecords", "fitnessLevel"];
      case 4:
        return ["stressLevel", "stressPains", "stressEater"];
      case 5:
        return ["sleepHours", "teethGrinding"];
      case 6:
        return ["playedSports"];
      case 7:
        return ["height", "weight", "age"];
      case 8:
        return ["fitnessGoals"];
      default:
        return [];
    }
  };

  const handleRegistration = () => {
    const payload = getValues();
    console.log("PAYLOAD", payload);


    if (payload?.username.includes(" ")) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Username should not contain space."
      })
      return
    }


    registerFun(payload, {
      onSuccess: (res) => {
        reset(registrationDefaultValues);
        setFormStep(0);
        setActiveTab("login");
        console.log("RESSS", res);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "User registered successfully. Please check your email to verify your account."
        })

      }, onError: (err) => {
        console.log("ERRIR", err)
        Toast.show({

          type: "error",
          text1: "Error",
          text2: err?.response?.data?.detail || err?.detail || "Something went wrong! Try again"

        })
      }
    })



    // registerMutation.mutate(payload as any, {
    //   onSuccess: () => {
    //     reset(registrationDefaultValues);
    //     setFormStep(0);
    //     setActiveTab("login");
    //   },
    // });
  };


  const checkActiveSubscription = async () => {
    try {
      const activeSub = await iapService.getActiveSubscription();
      if (activeSub) {
        setHasSubscription(true)

        console.log('Active subscription found:', activeSub);
        return true
      } else {
        setHasSubscription(false)

        return false
      }

    } catch (error) {
      setHasSubscription(false)

      console.error('Failed to check active subscription:', error);
      return false
    }
  };


  useEffect(() => {
    setIsLoading(true)
    const initAndCheck = async () => {
      try {
        await iapService.initIAP();
      } catch (e) {
        console.warn('IAP init failed in auth page:', e);
      }
      let token = await getToken()

      // Only check subscription if user is already logged in

      if (user && token) {
        await checkActiveSubscription();
        setIsLoading(false)
      } else {
        // setIsLoading(false)

      }

    };
    initAndCheck();
  }, [user]) // Add user as dependency



  let navigationProcess = async () => {

    let token = await getToken()
    console.log("USERRRR", user, token, hasSubscription);



    if (user && token && hasSubscription !== null) {
      if (hasSubscription) {
        router.replace("/ai-coach");
        setIsLoading(false)
      } else {
        router.replace("/subscription")
        setIsLoading(false)

      }
    }

  }




  useEffect(() => {
    navigationProcess()
    // if (user) {
    //   router.replace("/ai-coach");
    // }

  }, [user, router, hasSubscription]);

  // if (user) {
  //   return null;
  // }

  const isCoffeeDrinker = watch('coffeeDrinker');
  const isAlcoholDrinker = watch('alcoholDrinker');
  const isSmoker = watch('smoker');
  const cupsPerDay = watch('coffeeCupsPerDay');
  const hadSurgery = watch('hadSurgery');


  const loginPress = async () => {
    let payload = loginForm.getValues()
    console.log("PAYLOD", payload);

    loginFun(payload, {
      onSuccess: async (res) => {

        console.log("RESSS", res);
        if (res?.status === 200) {

          await AsyncStorage.setItem(AUTH_KEY, res?.data?.token);
          await AsyncStorage.setItem("userId", res?.data?.user?.id);
          await refetch()
          // if (data) {
          //   login(data)
          // } else {
          await login(res?.data?.user)
          // }

          refetch()

          // Check subscription status after successful login
          await checkActiveSubscription();

        }


      },
      onError: (err: any) => {
        if (err.response) {
          console.log("ERRR DATA:", err.response.data)
          if (err?.response?.data?.detail?.isVerified === false) {

            setResendVerification(err?.response?.data?.detail?.resendVerificationUrl)
            resendVerificationEmail(err?.response?.data?.detail?.resendVerificationUrl)
            // Toast.show({
            //   type: "info",
            //   text1: "Info",
            //   text2: "Verification email has been sent to you. Please check your email"
            // })
          }
          else {
            // console.log("ERRR", err.message);
            Toast.show({
              type: "error",
              text1: "Error",
              text2: err.response.data?.detail || err?.detail || "Something went wrong! Try again"
            })
          }
        } else {
          // console.log("ERRR", err.message);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: err.response.data?.detail || err?.detail || "Something went wrong! Try again"
          });
        }
      }
    })
  }


  console.log("data Logged IN", data);
  useEffect(() => {
    if (user) {
      login(data)
    }
  }, [isRefetching])


  const resendVerificationEmail = async (url?: string) => {
    try {
      const response = await fetch(
        `${AGENT_BASE_URL}${url ? url : resendVerification}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
          },
        }
      );

      const data = await response.json();
      Toast.show({

        type: "info", text1: "Pending Verification", text2: "A verification email has been sent to you. Please check your inbox."
      })
      console.log("✅ Resend Verification Response:", data);
      return data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || error?.response?.message || "Something went wrong"
      })
      console.error("❌ Error resending verification:", error);
      throw error;
    } finally {
      // setResendVerification(null)
    }
  };


  if (isLoading && (user)) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size={"large"} /></View>

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 5, android: 0 }) ?? 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      // keyboardDismissMode="on-drag"
      // contentInsetAdjustmentBehavior="always"
      // automaticallyAdjustKeyboardInsets
      >
        <Card style={styles.card}>
          <CardHeader style={{ width: '100%', }}>
            <View style={styles.headerContainer}>
              <Image source={require("../assets/icon.png")} style={styles.logo} />
              <Text style={{ flex: 1, marginLeft: 4, fontSize: 17, fontWeight: '600', bottom: 3 }}>ONE<Text numberOfLines={1} style={{ fontSize: 15 }}> - AI Fitness Trainer - Agent</Text></Text>
            </View>
            <CardDescription style={{ marginTop: 8 }}>
              Sign in or create a new account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="login">
                    Login
                </TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form style={{ marginTop: 10 }} {...loginForm}>
                  <Controller
                    control={loginForm.control}
                    name="username"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Choose a username"
                            value={field.value}
                            onChangeText={field.onChange}
                          />
                        </FormControl>
                        {error && <FormMessage>{error.message}</FormMessage>}
                      </FormItem>
                    )}
                  />

                  <Controller
                    control={loginForm.control}
                    name="password"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="*****"
                            onChangeText={field.onChange}
                            secureTextEntry
                            {...field}
                          />
                        </FormControl>
                        {error && <FormMessage>{error.message}</FormMessage>}
                      </FormItem>
                    )}
                  />

                  <TouchableOpacity onPress={loginPress} style={{
                    width: '100%', paddingVertical: 16, alignItems: 'center', justifyContent: 'center',

                    backgroundColor: "#007BFF",

                  }}>
                    {
                      isPending ? <ActivityIndicator color="white" size={"small"} /> :


                        <Text style={{ fontSize: 16, color: "white", fontWeight: "600" }}>Login</Text>
                    }

                  </TouchableOpacity>

                  <TouchableOpacity style={{ marginVertical: 12, alignSelf: 'flex-end' }} onPress={() => router.push("./forgot-password")}>
                    <Text style={{ fontSize: 16, fontWeight: '500', }}>Forgot Password?</Text>
                  </TouchableOpacity>




                  {
                    resendVerification !== null &&

                    <TouchableOpacity onPress={() => resendVerificationEmail()} style={{
                      width: '100%', paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10,
                      borderColor: "#007BFF",
                      borderWidth: 1

                    }}>
                      {
                        isPending ? <ActivityIndicator color="white" size={"small"} /> :


                          <Text style={{ fontSize: 16, color: "#007BFF", fontWeight: "600" }}>Resend Verification</Text>
                      }

                    </TouchableOpacity>
                  }





                </Form>
              </TabsContent>

              <TabsContent value="register">
                {/* <Form control={control} handleSubmit={handleSubmit}> */}
                <ScrollView showsHorizontalScrollIndicator={false} horizontal style={{ flex: 1, marginTop: 16 }} contentContainerStyle={styles.progressContainer}>
                  <View style={{ flexDirection: "row", alignItems: 'center', }}>
                    {formSteps.map((step, index) => (
                      <View
                        // onPress={() => setFormStep(index)}
                        key={index}
                        style={[styles.step, index <= formStep && styles.activeStep]}
                      >
                        {step.icon}
                        <Text style={styles.stepText}>{step.name}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>

                {formStep === 0 && (
                  <View>
                    <Text style={styles.stepTitle}>Account Information</Text>
                    <Controller
                      control={control}
                      name="username"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              onChangeText={field.onChange}
                              placeholder="Choose a username"
                              value={field.value}

                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />

                    <Controller
                      control={control}
                      name="password"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              onChangeText={field.onChange}
                              placeholder="Enter a password"
                              secureTextEntry
                              value={field.value}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />

                    <Controller
                      control={control}
                      name="name"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              onChangeText={field.onChange}
                              placeholder="Your full name"
                              value={field.value}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />

                    <Controller
                      control={control}
                      name="email"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              onChangeText={field.onChange}
                              placeholder="Email address"
                              value={field.value}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />

                    <Controller
                      control={control}
                      name="phone"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              onChangeText={field.onChange}
                              placeholder="Phone number"
                              value={field.value}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />
                    <Controller
                      control={control}
                      name="city"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              onChangeText={field.onChange}
                              placeholder="City"
                              value={field.value}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />
                    <Controller
                      control={control}
                      name="zip_code"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>Zip Code (US Only)</FormLabel>
                          <FormControl>
                            <Input
                              keyboardType="numeric"
                              onChangeText={field.onChange}
                              placeholder="e.g 10005"
                              value={field.value}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />
                  </View>
                )}
                {formStep === 1 && (
                  <View>
                    <Text style={styles.stepTitle}>Nutrition Information</Text>

                    <Controller
                      control={control}
                      name="nutritionRating"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>Nutrition Rating (1-10)</FormLabel>
                          <FormControl>
                            <Input
                              keyboardType="numeric"
                              value={String(field.value || '')}
                              onChangeText={(text) => field.onChange(Number(text) || 0)}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />

                    <Controller
                      control={control}
                      name="dailyDiet"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>What does your daily diet look like?</FormLabel>
                          <FormControl>
                            <Input
                              multiline
                              placeholder="Describe what you typically eat in a day"
                              value={field.value}
                              onChangeText={field.onChange}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />

                    <Controller
                      control={control}
                      name="waterIntake"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>How much water do you drink per day?</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 2 liters, 8 cups, etc."
                              value={field.value}
                              onChangeText={field.onChange}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />

                    <View style={styles.row}>
                      <Text style={styles.label}>Do you drink coffee?</Text>
                      <Controller
                        control={control}
                        name="coffeeDrinker"
                        render={({ field: { value, onChange } }) => (
                          <Checkbox checked={!!value} onCheckedChange={onChange} />
                        )}
                      />
                    </View>
                    {isCoffeeDrinker && (
                      <View style={styles.counterContainer}>
                        <Text style={styles.subLabel}>How many cups per day?</Text>
                        <Controller
                          control={control}
                          name="coffeeCupsPerDay"
                          render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <View>
                              <View style={styles.counter}>
                                <TouchableOpacity
                                  onPress={() => onChange(Math.max((value ?? 0) - 1, 0))}
                                  style={styles.counterButton}
                                >
                                  <Text style={styles.counterButtonText}>-</Text>
                                </TouchableOpacity>

                                <Text style={styles.counterValue}>{value ?? 0}</Text>

                                <TouchableOpacity
                                  onPress={() => onChange((value ?? 0) + 1)}
                                  style={styles.counterButton}
                                >
                                  <Text style={styles.counterButtonText}>+</Text>
                                </TouchableOpacity>
                              </View>
                              {error && <FormMessage>{error.message}</FormMessage>}
                            </View>
                          )}
                        />
                      </View>
                    )}

                    {/* Alcohol Drinker */}
                    <View style={styles.row}>
                      <Text style={styles.label}>Do you drink alcohol?</Text>
                      <Controller
                        control={control}
                        name="alcoholDrinker"
                        render={({ field: { value, onChange } }) => (
                          <Checkbox checked={!!value} onCheckedChange={onChange} />
                        )}
                      />
                    </View>
                    {isAlcoholDrinker && (
                      <View style={styles.inputGroup}>
                        <Text style={styles.subLabel}>How often / how much?</Text>
                        <Controller
                          control={control}
                          name="alcoholPerWeek"
                          render={({ field, fieldState: { error } }) => (
                            <View>
                              <Input
                                placeholder="e.g three beers, two glasses of wine"
                                value={field.value}
                                onChangeText={field.onChange}
                              />
                              {error && <FormMessage>{error.message}</FormMessage>}
                            </View>
                          )}
                        />
                      </View>
                    )}

                    {/* Smoker */}
                    <View style={styles.row}>
                      <Text style={styles.label}>Do you smoke?</Text>
                      <Controller
                        control={control}
                        name="smoker"
                        render={({ field: { value, onChange } }) => (
                          <Checkbox checked={!!value} onCheckedChange={onChange} />
                        )}
                      />
                    </View>
                    {isSmoker && (
                      <View style={styles.inputGroup}>
                        <Text style={styles.subLabel}>How frequently?</Text>
                        <Controller
                          control={control}
                          name="smokingFrequency"
                          render={({ field, fieldState: { error } }) => (
                            <View>
                              <Input
                                placeholder="e.g. 5 cigarettes per day"
                                value={field.value}
                                onChangeText={field.onChange}
                              />
                              {error && <FormMessage>{error.message}</FormMessage>}
                            </View>
                          )}
                        />
                      </View>
                    )}

                    <Controller
                      control={control}
                      name="dietType"
                      render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <View>
                          <FormLabel>Diet Type</FormLabel>
                          <View style={styles.dietInputGroup}>
                            <Select
                              onValueChange={onChange}
                              value={value}
                              placeholder={{ label: 'Select your diet type', value: null }}
                              items={[
                                { label: 'Meat Eater', value: 'Meat Eater' },
                                { label: 'Vegetarian', value: 'Vegetarian' },
                                { label: 'Vegan', value: 'Vegan' },
                              ]}
                              useNativeAndroidPickerStyle={false}
                            />
                          </View>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </View>
                      )}
                    />

                    <Controller
                      control={control}
                      name="dietaryRestrictions"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>Dietary Restrictions</FormLabel>
                          <FormControl>
                            <Input
                              multiline
                              numberOfLines={4}
                              placeholder="List any allergies or dietary restrictions"
                              value={field.value}
                              onChangeText={field.onChange}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />
                    <Controller
                      control={control}
                      name="medicationsSupplements"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>Medications & Supplements</FormLabel>
                          <FormControl>
                            <Input
                              multiline
                              numberOfLines={4}
                              placeholder="List any medications or supplements you are using"
                              value={field.value}
                              onChangeText={field.onChange}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />
                  </View>
                )}

                {formStep === 2 && (
                  <View>
                    <Text style={styles.stepTitle}>Injuries & Surgery</Text>

                    <Controller
                      control={control}
                      name="injuries"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>Injuries</FormLabel>
                          <FormControl>
                            <Input
                              multiline
                              placeholder="Describe any injuries"
                              value={field.value}
                              onChangeText={field.onChange}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />
                    <View style={styles.row}>
                      <Text style={styles.label}>Have you had any surgeries?</Text>
                      <Controller
                        control={control}
                        name="hadSurgery"
                        render={({ field: { value, onChange } }) => (
                          <Checkbox checked={!!value} onCheckedChange={onChange} />
                        )}
                      />
                    </View>
                    {hadSurgery &&
                      <Controller
                        control={control}
                        name="surgeryDate"
                        render={({ field, fieldState: { error } }) => (
                          <FormItem>
                            <FormLabel>When was your surgery?</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g January 2023"
                                value={field.value}
                                onChangeText={field.onChange}
                              />
                            </FormControl>
                            {error && <FormMessage>{error.message}</FormMessage>}
                          </FormItem>
                        )}
                      />
                    }
                  </View>
                )}

                {formStep === 3 && (
                  <View>
                    <Text style={styles.stepTitle}>Exercise Routine</Text>

                    <Controller
                      control={control}
                      name="currentExercises"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>What types of exercises do you currently do, if any?</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Describe your current exercise routine"
                              value={field.value}
                              onChangeText={field.onChange}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />
                    <Controller
                      control={control}
                      name="personalRecords"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>Do you have any personal records? If so, please list them.</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g 5k steps, bench press etc"
                              value={field.value}
                              onChangeText={field.onChange}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />
                    <Controller
                      control={control}
                      name="fitnessLevel"
                      render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <View>
                          <FormLabel>Fitness Level</FormLabel>
                          <View style={styles.dietInputGroup}>
                            <Select
                              onValueChange={onChange}
                              value={value}
                              placeholder={{ label: 'Select your fitness level', value: null }}
                              items={[
                                { label: 'Beginner', value: 'Beginner' },
                                { label: 'Intermediate', value: 'Intermediate' },
                                { label: 'Advanced', value: 'Advanced' },
                                { label: 'Elite', value: 'Elite' },
                              ]}
                              useNativeAndroidPickerStyle={false}
                            />
                          </View>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </View>
                      )}
                    />
                  </View>
                )}

                {formStep === 4 && (
                  <View>
                    <Text style={styles.stepTitle}>Stress Levels</Text>

                    <Controller
                      control={control}
                      name="stressLevel"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>On a scale of 1-10, how stressed are you typically?</FormLabel>
                          <FormControl>
                            <Input
                              keyboardType="numeric"
                              value={String(field.value)}
                              onChangeText={(text) => field.onChange(Number(text) || 0)}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />
                    <View style={styles.row}>
                      <Text style={styles.label}>Do you experience headaches or muscle pain when stressed?</Text>
                      <Controller
                        control={control}
                        name="stressPains"
                        render={({ field: { value, onChange } }) => (
                          <Checkbox checked={!!value} onCheckedChange={onChange} />
                        )}
                      />
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Do you stress eat?</Text>
                      <Controller
                        control={control}
                        name="stressEater"
                        render={({ field: { value, onChange } }) => (
                          <Checkbox checked={!!value} onCheckedChange={onChange} />
                        )}
                      />
                    </View>
                  </View>
                )}

                {formStep === 5 && (
                  <View>
                    <Text style={styles.stepTitle}>Sleep Habits</Text>

                    <Controller
                      control={control}
                      name="sleepHours"
                      render={({ field, fieldState: { error } }) => (
                        <View>
                          <IncrementInput
                            label="Average Sleep Hours"
                            value={field.value || 0}
                            onChange={field.onChange}
                            min={0}
                            max={24}
                          />
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </View>
                      )}
                    />
                    <View style={styles.row}>
                      <Text style={styles.label}>Do you grind your teeth at night?</Text>
                      <Controller
                        control={control}
                        name="teethGrinding"
                        render={({ field: { value, onChange } }) => (
                          <Checkbox checked={!!value} onCheckedChange={onChange} />
                        )}
                      />
                    </View>
                  </View>
                )}

                {formStep === 6 && (
                  <View>
                    <Text style={styles.stepTitle}>Sports</Text>

                    <Controller
                      control={control}
                      name="playedSports"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>What sports have you played, if any?</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Football, Tennis"
                              value={field.value}
                              onChangeText={field.onChange}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />
                  </View>
                )}

                {formStep === 7 && (
                  <View>
                    <Text style={styles.stepTitle}>Measurements</Text>

                    <Controller
                      control={control}
                      name="height"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>What is your height?</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g 5.10 inches, 168cm"
                              value={field.value}
                              onChangeText={field.onChange}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />
                    <Controller
                      control={control}
                      name="weight"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>What is your weight?</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g 160lbs, 72kg"
                              value={field.value}
                              onChangeText={field.onChange}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />
                    <Controller
                      control={control}
                      name="age"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>What is your age?</FormLabel>
                          <FormControl>
                            <Input
                              keyboardType="numeric"
                              placeholder="e.g 25"
                              value={field?.value?.toString() || ''}
                              onChangeText={(text) => field.onChange(Number(text) || 0)}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />
                  </View>
                )}

                {formStep === 8 && (
                  <View>
                    <Text style={styles.stepTitle}>Your Fitness Goals</Text>

                    <Controller
                      control={control}
                      name="fitnessGoals"
                      render={({ field, fieldState: { error } }) => (
                        <FormItem>
                          <FormLabel>Fitness Goals</FormLabel>
                          <FormControl>
                            <Input
                              multiline
                              placeholder="Describe your goals"
                              value={field.value}
                              onChangeText={field.onChange}
                            />
                          </FormControl>
                          {error && <FormMessage>{error.message}</FormMessage>}
                        </FormItem>
                      )}
                    />
                  </View>
                )}

                <View style={styles.buttonContainer}>
                  {formStep > 0 && (
                    <Button onPress={prevStep} variant="outline">
                      <Feather size={16} /> Previous
                    </Button>
                  )}

                  {formStep < formSteps.length - 1 && (
                    <Button onPress={(nextStep)}>
                      Next
                    </Button>
                  )}

                  {formStep === formSteps.length - 1 && (
                    <Button
                      onPress={handleRegistration}
                      disabled={isPendingRegister}
                    >
                      {isPendingRegister
                        ? "Registering..."
                        : "Complete Registration"}
                    </Button>
                  )}
                </View>
                {/* </Form> */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F3F4F6",
  },
  card: {
    width: "100%",
    marginTop: 60,
    borderWidth: 1,
    borderColor: "red"
  },
  incrementInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: '100%',
    justifyContent: 'center'
  },
  logo: {
    width: 48,
    height: 48,
  },
  link: {
    color: "#007BFF",
    textAlign: "center",
    marginTop: 16,
  },
  progressContainer: {
    marginBottom: 24,
    flexGrow: 1
  },
  step: {
    alignItems: "center",
    opacity: 0.5,
    marginHorizontal: 8
  },
  activeStep: {
    opacity: 1,
    marginHorizontal: 8,
    alignItems: "center"
  },
  stepText: {
    fontSize: 12,
    marginTop: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    maxWidth: "80%"
  },
  subLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: '#444',
  },
  inputGroup: {
    marginBottom: 16,
  },
  dietInputGroup: {
    marginBottom: 16,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    fontSize: 14,
  },
  counterContainer: {
    marginBottom: 16,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  counterButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  counterValue: {
    fontSize: 16,
    minWidth: 30,
    textAlign: 'center',
  },
});