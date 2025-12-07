import { router, Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "./context/useAuth";
import { useEffect } from "react";
import * as Location from "expo-location";
import { useUserStore } from "../src/utils/zustandStore";
import * as Linking from "expo-linking";
import VerifyEmail from "../screens/verify-email";
import AsyncStorage from "@react-native-async-storage/async-storage";
;
const queryClient = new QueryClient();
export default function AppNavigator() {
  // const { user } = useAuth()

  useEffect(() => {
    const handleDeepLink = async (event: Linking.EventType) => {
      const url = event.url;
      const { path, queryParams } = Linking.parse(url);
      let user = await AsyncStorage.getItem("user");
      console.log("USERR", user);


      if (path === "verify") {
        if (user) {
          console.log("ENTERED",);

          router.replace(`/ai-coach`);
          return
        }


        const { token } = queryParams;

        console.log("TOKEN", token);

        router.replace(`/verify?token=${token}`);
      }
      if (path === "reset-password") {
        const { token } = queryParams;

        router.replace(`/reset-password?token=${token}`);
      }
    };

    // Listen for incoming links
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Handle the case when the app is cold-started from a link
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl } as Linking.EventType);
      }
    })();

    return () => subscription.remove();
  }, []);










  return (
    <QueryClientProvider client={queryClient}>

      <AuthProvider>

        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
          <Stack.Screen name="verify" options={{ headerShown: false }} />
          <Stack.Screen name="reset-password" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="subscription" options={{ headerShown: false }} />
          <Stack.Screen name="ai-coach" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="measurements" options={{ headerShown: false }} />
          <Stack.Screen name="goals" options={{ headerShown: false }} />
          <Stack.Screen name="attendance" options={{ headerShown: false }} />
          <Stack.Screen name="nutrition" options={{ headerShown: false }} />
          <Stack.Screen name="activities" options={{ headerShown: false }} />
          <Stack.Screen name="workout" options={{ headerShown: false }} />
          <Stack.Screen name="notification-settings" options={{ headerShown: false }} />
          <Stack.Screen name="rewards" options={{ headerShown: false }} />
          {/* <Stack.Screen name="connectHealth" options={{ headerShown: false }} /> */}
          {/* <Stack.Screen name="admin/dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="admin/clients" options={{ headerShown: false }} />
      <Stack.Screen name="admin/analytics" options={{ headerShown: false }} />
      <Stack.Screen name="admin/blog" options={{ headerShown: false }} /> */}
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>

      <Toast />
    </QueryClientProvider>
  );
}