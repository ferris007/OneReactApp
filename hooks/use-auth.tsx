import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
// Update the import path below to the correct location of your schema file.
// For example, if your schema is in 'src/shared/schema.ts', use the following:
import { insertUserSchema, User as SelectUser, InsertUser, RegistrationPayload } from "../shared/schema";
// If the file does not exist, create it or correct the path as needed.
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "./use-toast";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AUTH_KEY } from "../app/api-calls/variables";
import { useUserDetails } from "../app/api-calls/Auth/auth";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegistrationPayload>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useUserDetails()



  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("CREDENTIALS", credentials);

      const res = await apiRequest("POST", "api/mobile/login", credentials);
      console.log("RESULTS", res);


      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();

      await AsyncStorage.setItem(AUTH_KEY, data?.token);
      await AsyncStorage.setItem("userId", data?.user?.id);

      return data as SelectUser; // 👈 return just the user object
    },

    onSuccess: (user: SelectUser) => {
      console.log("USEERR", user);

      // Store only the user in cache
      // queryClient.setQueryData(["/api/user"], user?.user);

      Toast.show({
        type: "success",
        text1: "Login successful",
      });
      router.replace("/ai-coach");
    },
    onError: (error: Error) => {
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: error?.message,
      });
    },
  });


  const registerMutation = useMutation({
    mutationFn: async (credentials: RegistrationPayload) => {
      const res = await apiRequest("POST", "/api/mobile/register", credentials);
      console.log("RESSS", res);

      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      Toast.show({
        type: "success",
        text1: "Registration Success",
        text2: "Registration successful! Please log in.",
      });
      // queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: error.message,
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: async () => {
      // Clear user cache
      queryClient.clear();
      queryClient.removeQueries({ queryKey: ["/api/user"] });

      await AsyncStorage.removeItem(AUTH_KEY);
      await AsyncStorage.removeItem("userId"); // 👈 better to remove, not set ""

      Toast.show({
        type: "success",
        text1: "Logged out",
      });
      router.replace("/auth");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });


  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
