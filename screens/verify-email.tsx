import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, SafeAreaView, Text, View, Alert, TouchableOpacity } from "react-native";
import { Button } from "../components/ui/Button";
import { AGENT_BASE_URL } from "../app/api-calls/variables";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../app/context/useAuth";

const VerifyEmail = () => {
    const { user } = useAuth()
    const { token, uid } = useLocalSearchParams<{ token?: string, uid: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const [resendEmail, setResendEmail] = useState(false);
    console.log("TONEBBB", token);
    console.log("UID", uid);


    const resendVerificationEmail = async () => {
        try {
            const response = await fetch(
                `${AGENT_BASE_URL}/api/mobile/resend-verification?uid=${uid}`,
                {
                    method: "POST",
                    headers: {
                        accept: "application/json",
                    },
                }
            );
            const data = await response.json();

            if (response?.status >= 200 && response?.status <= 299) {
                Toast.show({

                    type: "success", text1: "Success", text2: "A verification email has been resent to you. Please check your inbox."
                })
                setResendEmail(false)
            } else {
                setResendEmail(false)
                Toast.show({

                    type: "error", text1: "Error", text2: data?.detail || "Somethibg went wrong try again"
                })
                return
            }


            console.log("✅ Resend Verification Response:", data);
            return data;
        } catch (error) {
            setResendEmail(false)
            Toast.show({
                type: "error", text1: "Error", text2: error?.message || error?.response?.message || "Something went wrong"
            })
            console.error("❌ Error resending verification:", error);
            throw error;
        } finally {
            setResendEmail(false)
        }
    };



    const verificaition = async () => {
        console.log("UID", uid, token);

        try {
            const response = await fetch(
                `${AGENT_BASE_URL}/api/mobile/verify?uid=${uid}&token=${token}`,
                {
                    method: "POST",
                    headers: {
                        accept: "application/json",
                    },
                }
            );


            const data = await response.json()

            console.log("DATATA", data);


            console.log("RESPONSEEE", response);
            if (response?.status >= 200 && response?.status <= 299) {
                Alert.alert("Success", "Your email has been verified!", [
                    {
                        text: "Go to Login",
                        onPress: () => { router?.back() || router?.replace("/auth") },
                    },
                ]);
                return data;

            } else {
                setResendEmail(true)
                Toast.show({
                    type: "error", text1: "Error", text2: data?.detail || "Something went wrong"
                })
            }


            // Toast.show({
            //     type: "success", text1: "Verified", text2: "Email Verified"
            // })

        } catch (error) {
            Toast.show({
                type: "error", text1: "Error", text2: error?.message || error?.response?.message || "Something went wrong"
            })
            console.error("❌ Error resending verification:", error);
            throw error;
        } finally {
            setLoading(false)
            // setResendVerification(null)
        }
    };

    const checkUser = async () => {
        await AsyncStorage.getItem("user")
    }

    useEffect(() => {
        console.log("USERR", user);

        if (user) {
            router.replace("/ai-coach")
            Toast.show({
                type: "info",
                text1: "Info",
                text2: "user Already verified"
            })
        }
    }, [user])



    const handleVerify = async () => {
        if (!token || !uid) {
            Alert.alert("Error", "Verification token or Uid is missing. Try new wmail");
            setResendEmail(true)
            return;
        }

        try {
            setLoading(true);


            verificaition()
        } catch (error) {
            Alert.alert("Error", "Verification failed. Please try again.");
            setLoading(false);

        } finally {
            // setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <View style={{ paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Image
                    resizeMode="contain"
                    style={{ width: 120, height: 120, marginBottom: 30 }}
                    source={require("../assets/TrasnparentLogo.png")}
                />

                <Text style={{ fontSize: 26, fontWeight: "700", marginBottom: 10 }}>
                    Verify Your Email
                </Text>

                <Text style={{ fontSize: 16, color: "#666", textAlign: "center", marginBottom: 30 }}>
                    Please confirm your email address to continue. Tap the button below to verify.
                </Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#007AFF" />
                ) : (
                    <Button onPress={handleVerify}>
                        {
                            loading ? <ActivityIndicator
                                size={"small"}
                                color={"red"}
                            />
                                :
                                <Text >Verify Email</Text>
                        }
                    </Button>
                )}

                {
                    resendEmail &&

                    <TouchableOpacity onPress={resendVerificationEmail} style={{
                        width: '100%', paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10,
                        borderColor: "#007BFF",
                        borderWidth: 1,
                        paddingHorizontal: 12,
                        borderRadius: 8

                    }}>
                        <Text style={{ fontSize: 16, color: "#007BFF", fontWeight: "600" }}>Resend Verification</Text>

                    </TouchableOpacity>
                }
                {resendEmail &&
                    <TouchableOpacity onPress={() => router?.replace("/auth")} style={{
                        width: '100%', paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10,
                        borderColor: "#007BFF",
                        borderWidth: 1,
                        paddingHorizontal: 12,
                        borderRadius: 8

                    }}>
                        <Text style={{ fontSize: 16, color: "#007BFF", fontWeight: "600" }}>Go To Login</Text>

                    </TouchableOpacity>
                }


            </View>
        </SafeAreaView>
    );
};

export default VerifyEmail;
