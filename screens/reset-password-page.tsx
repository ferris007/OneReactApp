import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView } from "react-native";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { useResetPassword } from "../app/api-calls/Auth/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token: queryToken } = useLocalSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState("");
  const { toast } = useToast();


  const { mutate: resetPassword, isPending: isLoading, } = useResetPassword()




  console.log("WUERY TOKJEN", queryToken);

  useEffect(() => {
    if (queryToken) {
      setToken(queryToken as string);
    } else {
      Toast.show({
        type: "error",
        text1: "Invalid Link",
        text2: "The password reset link is invalid or missing.",
      });
      router.replace("/auth");
    }
  }, [queryToken, router, toast]);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields",
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password must be at least 6 characters long",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match",
      });
      return;
    }


    try {
      let payload = {
        token: token,
        newPassword: password
      }
      resetPassword(payload, {
        onSuccess: (res) => {
          console.log("RES", res);

          setIsSuccess(true);
          Toast.show({
            type: 'success',
            text1: "Success",
            text2: "Your password has been updated successfully.",
          });
        }, onError: (err) => {
          console.log("ERROR");
          Toast.show({
            type: "error",
            text1: "Error",
            text2: err.message || "Failed to reset password",
          });

        }
      })



    }


    //   const response = await apiRequest("POST", "/api/reset-password", { token: token, newPassword: password });
    //   console.log("RESPONSE", response);

    //   const data = await response.json();
    //   console.log("datadata", data);

    //   if (response.ok) {
    //     setIsSuccess(true);
    //     Toast.show({
    //       type: 'success',
    //       text1: "Success",
    //       text2: "Your password has been updated successfully.",
    //     });
    //   } else {
    //     Toast.show({
    //       type: "error",
    //       text1: "Error",
    //       text2: data.message || "Failed to reset password",
    //     });
    //   }
    // } 

    catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Network error. Please try again.",
      });
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <Card style={styles.card}>
          <CardHeader style={styles.header}>
            <View style={styles.iconContainer}>
              <Feather name="check-circle" size={24} color="green" />
            </View>
            <CardTitle>Password Updated</CardTitle>
            <CardDescription>
              Your password has been successfully updated. You can now log in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onPress={() => router.replace("/auth")}>
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 5, android: 0 }) ?? 0}
    >
      <SafeAreaView style={styles.container}>
        <Card style={styles.card}>
          <CardHeader style={styles.header}>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription style={{ fontSize: 18, fontWeight: '500' }}>
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                secureTextEntry={!showPassword}
                placeholder="Enter new password"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Feather name="eye-off" size={20} color="gray" />
                ) : (
                  <Feather name="eye" size={20} color="gray" />
                )}
              </TouchableOpacity>
            </View>
            {password && password.length < 6 && (
              <Text style={styles.errorText}>Password must be at least 6 characters</Text>
            )}

            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                secureTextEntry={!showConfirmPassword}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <Feather name="eye-off" size={20} color="gray" />
                ) : (
                  <Feather name="eye" size={20} color="gray" />
                )}
              </TouchableOpacity>
            </View>
            {confirmPassword && password && password !== confirmPassword && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}

            <Button
              style={{ marginVertical: 12 }}
              onPress={handleSubmit} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>

            <Button onPress={() => router.replace("/auth")} variant="ghost">
              <Feather name="arrow-left" size={16} />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  card: {
    width: "90%",
    maxWidth: 400,
  },
  header: {
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    height: 40,
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
