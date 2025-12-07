import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, TextInput, SafeAreaView } from "react-native";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { Button } from "../components/ui/Button";
import { FontAwesome5 } from "@expo/vector-icons";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/forgot-password", { email });
      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          variant: "default",
          title: "Email sent",
          description: "If an account with that email exists, a password reset link has been sent.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to send password reset email",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container}>
        <Card style={styles.card}>
          <CardHeader style={styles.header}>
            <View style={styles.iconContainer}>
              {/* <Mail name="mail" size={24} color="green" /> */}
              <FontAwesome5
                name="envelope"
                size={24}
                color="green"
              />
            </View>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              If an account with that email exists, we've sent you a password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onPress={() => router.push("/auth")} variant="outline">
              {/* <ArrowLeft name="arrow-left" size={16} /> */}
              Back to Login
            </Button>
            <Button
              onPress={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
              variant="ghost"
            >
              Send another email
            </Button>
          </CardContent>
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.card}>
        <CardHeader style={styles.header}>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button onPress={handleSubmit} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
          <Button onPress={() => router.push("/auth")} variant="ghost">
            {/* <ArrowLeft name="arrow-left" size={16} /> */}
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </SafeAreaView>
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
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});
