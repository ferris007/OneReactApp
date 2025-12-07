import { z } from "zod";

export const users = {
  id: z.number(),
  createdAt: z.string().optional(),
  username: z.string(),
  password: z.string(),
  role: z.string(),
  name: z.string().optional(),
  email: z.string(),
  phone: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
  nutritionRating: z.number().optional(),
  dailyDiet: z.string().optional(),
  waterIntake: z.string().optional(),
  coffeeDrinker: z.boolean().optional(),
  coffeeCupsPerDay: z.number().optional(),
  alcoholDrinker: z.boolean().optional(),
  alcoholPerWeek: z.string().optional(),
  smoker: z.boolean().optional(),
  smokingFrequency: z.string().optional(),
  dietType: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  medicationsSupplements: z.string().optional(),
  injuries: z.string().optional(),
  hadSurgery: z.boolean().optional(),
  surgeryDate: z.string().optional(),
  currentExercises: z.string().optional(),
  personalRecords: z.string().optional(),
  fitnessLevel: z.string().optional(),
  stressLevel: z.number().optional(),
  stressPains: z.boolean().optional(),
  stressEater: z.boolean().optional(),
  sleepHours: z.number().optional(),
  teethGrinding: z.boolean().optional(),
  playedSports: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  age: z.number().optional(),
  fitnessGoals: z.string().optional(),
};

export const insertUserSchema = z.object(users);

export const registrationSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  city: z.string().optional(),
  zip_code: z.string().optional(),
  role: z.string(),
  nutritionRating: z.number().min(1).max(10).optional(),
  dailyDiet: z.string().optional(),
  waterIntake: z.string().optional(),
  coffeeDrinker: z.boolean().optional(),
  coffeeCupsPerDay: z.number().optional(),
  alcoholDrinker: z.boolean().optional(),
  alcoholPerWeek: z.string().optional(),
  smoker: z.boolean().optional(),
  smokingFrequency: z.string().optional(),
  dietType: z.enum(["Meat Eater", "Vegetarian", "Vegan"]).optional(),
  dietaryRestrictions: z.string().optional(),
  medicationsSupplements: z.string().optional(),
  injuries: z.string().optional(),
  hadSurgery: z.boolean().optional(),
  surgeryDate: z.string().optional(),
  currentExercises: z.string().optional(),
  personalRecords: z.string().optional(),
  fitnessLevel: z.string().optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  stressPains: z.boolean().optional(),
  stressEater: z.boolean().optional(),
  sleepHours: z.number().optional(),
  teethGrinding: z.boolean().optional(),
  playedSports: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  age: z.number().optional(),
  fitnessGoals: z.string().optional(),
});


export type RegistrationPayload = {
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  nutritionRating?: number;
  dailyDiet?: string;
  waterIntake?: string;
  coffeeDrinker?: boolean;
  coffeeCupsPerDay?: number;
  alcoholDrinker?: boolean;
  alcoholPerWeek?: string;
  smoker?: boolean;
  smokingFrequency?: string;
  dietType?: "Meat Eater" | "Vegetarian" | "Vegan";
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
  age?: number;
  fitnessGoals?: string;
};


export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof insertUserSchema>;

export const goals = {
  id: z.number(),
  userId: z.number(),
  month: z.string(),
  weightLoss: z.number(),
  muscleGain: z.number(),
  bodyFatReduction: z.number(),
  status: z.string(),
  achieved: z.object({
    weightLoss: z.boolean().optional(),
    muscleGain: z.boolean().optional(),
    bodyFatReduction: z.boolean().optional(),
  }).optional(),
};

export const goalSchema = z.object(goals);
export type Goal = z.infer<typeof goalSchema>;


export const activities = {
  id: z.number(),
  userId: z.number(),
  date: z.string(),
  activityType: z.string(),
  description: z.string(),
  filePath: z.string().optional(),
  createdAt: z.string(),
};

export const activitiesSchema = z.object(activities);
export type Activity = z.infer<typeof activitiesSchema>;

export const activitySchema = z.object({
  date: z.string().min(1, "Date is required"),
  activityType: z.string().min(1, "Activity type is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
});

export type ActivityFormData = z.infer<typeof activitySchema>;

export const workouts = {
  id: z.number(),
  userId: z.number(),
  uploadedAt: z.string(),
  uploadedBy: z.number(),
  filePath: z.string(),
  title: z.string(),
  notes: z.string().optional(),
};

export const workoutsSchema = z.object(workouts);
export type Workout = z.infer<typeof workoutsSchema>;

export const VIIFTBalance = z.object({
  totalEarned: z.number(),
  pendingBalance: z.number(),
  totalClaimed: z.number(),
  xrpWalletAddress: z.string().optional(),
  trustLineSetup: z.boolean().optional(),
});

export type VIIFTBalance = z.infer<typeof VIIFTBalance>;

export const CompletedGoal = z.object({
  id: z.number(),
  metric: z.string(),
  targetValue: z.number(),
  achievedValue: z.number(),
  rewardAmount: z.number(),
  completedAt: z.string(),
});

export type CompletedGoal = z.infer<typeof CompletedGoal>;

export const VIIFTTransaction = z.object({
  id: z.number(),
  type: z.string(),
  amount: z.number(),
  timestamp: z.string(),
  txHash: z.string().optional(),
  status: z.string(),
});

export type VIIFTTransaction = z.infer<typeof VIIFTTransaction>;

export const foodLogs = {
  id: z.number(),
  userId: z.number(),
  notes: z.string().optional(),
  filePath: z.string(),
  uploadedAt: z.string(),
};

export const foodLogSchema = z.object(foodLogs);
export type FoodLog = z.infer<typeof foodLogSchema>;

export const mealPlanSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.string(),
  uploadedAt: z.string(),
  url: z.string().optional(),
  filePath: z.string().optional(),
});

export type MealPlan = z.infer<typeof mealPlanSchema>;

export const measurementSchema = z.object({
  id: z.string(),
  userId: z.number().optional(),
  date: z.string().optional(),
  weight: z.number().optional(),
  bodyFat: z.number().optional(),
  bmi: z.number().optional(),
  muscleMass: z.number().optional(),
  boneMass: z.number().optional(),
  visceralFat: z.number().optional(),
  totalBodyWater: z.number().optional(),
  bmr: z.number().optional(),
  metabolicAge: z.number().optional(),
  proteinLevel: z.number().optional(),
  timestamp: z.string(),
  source: z.string().optional(),
  deviceName: z.string().optional(),
});

export type Measurement = z.infer<typeof measurementSchema>;

export const blogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string(),
});

export type BlogPost = z.infer<typeof blogPostSchema>;

export const attendanceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  date: z.string(),
  attended: z.boolean(),
  notes: z.string().optional(),
});

export type Attendance = z.infer<typeof attendanceSchema>;