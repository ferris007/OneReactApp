import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import * as iapService from "../hooks/iapService";
import { Subscription, ProductPurchase } from "react-native-iap";
import { FontAwesome5 } from "@expo/vector-icons";




const featuresList =
    [
        "BLOODWORK-DRIVEN WORKOUT AND MEAL PLANS",
        "GROCERY LIST → KROGER, INSTACART, WALMART",
        "FOOD LOG & ACTIVITY TRACKING",
        "DAILY SMS ACCOUNTABILITY",
        "APPLE HEALTH SYNC",
        "CHAT COMMUNITY",
        "CONCIERGE FOR GYMS & THERAPISTS",
        "VII COIN REWARDS FOR GOAL COMPLETION",
    ]







const SubscriptionScreen = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [activeSubscription, setActiveSubscription] = useState<ProductPurchase | null>(null);
    const router = useRouter();

    useEffect(() => {
        initializeIAP();
        checkActiveSubscription();

        // Setup purchase listeners
        const removePurchaseListener = iapService.setupPurchaseListener(
            (purchase) => {
                // Handle successful purchase
                console.log('Purchase completed:', purchase);
                checkActiveSubscription();
                Alert.alert('Success', 'Subscription activated successfully!');
                setIsLoading(false);
                try {
                    router.replace('/ai-coach');
                } catch (e) {
                    console.warn('Navigation error after purchase:', e);
                }
            },
            (error) => {
                // Handle purchase error
                console.error('Purchase failed:', error);
                Alert.alert('Purchase Failed', 'Unable to process subscription. Please try again.');
                setIsLoading(false);
            }
        );

        return () => {
            removePurchaseListener();
            iapService.endConnection();
        };
    }, []);

    const initializeIAP = async () => {
        try {
            setIsLoading(true);
            const availableSubs = await iapService.initIAP();
            setSubscriptions(availableSubs);
        } catch (error) {
            console.error('Failed to initialize IAP:', error);
            Alert.alert('Error', 'Failed to load subscription options');
        } finally {
            setIsLoading(false);
        }
    };

    const checkActiveSubscription = async () => {
        try {
            const activeSub = await iapService.getActiveSubscription();
            setActiveSubscription(activeSub);
            if (activeSub) {
                console.log('Active subscription found:', activeSub);
            }
        } catch (error) {
            console.error('Failed to check active subscription:', error);
        }
    };

    const handleSubscribe = async () => {
        if (activeSubscription) {
            Alert.alert('Already Subscribed', 'You already have an active subscription');
            return;
        }

        try {
            setIsLoading(true);
            const result = await iapService.requestSubscription(iapService.subscriptionSkus[0]);
            // The purchase listeners will handle success/error callbacks
            // Fallback: verify active subscription shortly after
            setTimeout(async () => {
                try {
                    const active = await iapService.getActiveSubscription();
                    if (active && active.productId) {
                        try {
                            router.replace('/ai-coach');
                        } catch (e) {
                            console.warn('Navigation error after fallback check:', e);
                        }
                    }
                } catch (e) {
                    console.warn('Active subscription check after request failed:', e);
                }
            }, 1200);
        } catch (error) {
            console.error('Subscription request failed:', error);
            Alert.alert('Subscription Failed', 'Unable to initiate subscription. Please try again.');
            setIsLoading(false);
        }
    };

    const getSubscriptionButtonText = () => {
        if (isLoading) return 'LOADING...';
        if (activeSubscription) return 'SUBSCRIPTION ACTIVE';
        return 'SUBSCRIBE';
    };

    const getSubscriptionButtonStyle = () => {
        if (activeSubscription) {
            return [styles.subscribeButton, styles.activeSubscriptionButton];
        }
        return styles.subscribeButton;
    };

    console.log('Available subscriptions:', subscriptions, activeSubscription);

    const handleCancelSubscription = async () => {
        try {
            Alert.alert(
                'Manage Subscription',
                'You will be redirected to your app store subscriptions page to cancel or manage your plan.',
                [
                    { text: 'Close', style: 'cancel' },
                    {
                        text: 'Open',
                        onPress: async () => {
                            try {
                                await iapService.openManageSubscriptions(activeSubscription?.productId);
                            } catch (err) {
                                Alert.alert('Error', 'Unable to open subscriptions management.');
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Cancel subscription flow error:', error);
            Alert.alert('Error', 'Unable to start cancellation.');
        }
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#8A9AA6" }}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                {/* Logo */}
                <Image
                    source={require("../assets/TrasnparentLogo.png")} // replace with your logo file
                    style={styles.logo}
                    resizeMode="contain"
                />

                {/* Header */}
                <Text style={styles.header}>
                    YOUR AI FITNESS COACH —{"\n"}
                    PERSONALIZED, SCIENCE-BACKED,{"\n"}
                    AND BUILT TO KEEP YOU ON TRACK
                </Text>

                {/* Features */}
                <View style={styles.featureList}>
                    {featuresList?.map((item, idx) => (
                        <Text key={idx} style={styles.feature}>
                            <FontAwesome5 name={"check"} size={20} color={"#3e4952ff"} /> {item}
                        </Text>
                    ))}
                </View>

                {/* Plan */}
                <Text style={styles.planText}>MONTHLY PLAN</Text>
                <Text style={styles.planPrice}>$24.99 / Month</Text>
                <Text style={styles.trialText}>3 Day Free Trial Included</Text>

                {/* Subscribe Button */}
                <TouchableOpacity
                    style={getSubscriptionButtonStyle()}
                    onPress={handleSubscribe}
                    disabled={isLoading || !!activeSubscription}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.subscribeText}>{getSubscriptionButtonText()}</Text>
                    )}
                </TouchableOpacity>

                {/* Active Subscription Status */}
                {activeSubscription && (
                    <View style={styles.activeSubscriptionContainer}>
                        <Text style={styles.activeSubscriptionText}>
                            ✅ You have an active subscription
                        </Text>
                        <Text style={styles.subscriptionDetails}>
                            Product ID: {activeSubscription.productId}
                        </Text>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSubscription}>
                            <Text style={styles.cancelText}>CANCEL SUBSCRIPTION</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Footer */}
                <Text style={styles.footer}>
                    ALWAYS ON. ALWAYS ONE
                </Text>

                <Text style={styles.disclaimer}>
                    • Payment charged to Apple ID on confirmation.{"\n"}
                    • Auto-renews unless canceled 24h before end.{"\n"}
                    • Manage/cancel in App Store settings.{"\n"}
                    • Unused trial forfeits on purchase.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        alignItems: "center",
    },
    logo: {
        width: 120,
        height: 120,
        // marginBottom: 20,
    },
    header: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
        marginVertical: 20,
        color: "#0C2340",
    },
    featureList: {
        width: "100%",
        marginBottom: 20,
    },
    feature: {
        fontSize: 18,
        marginBottom: 8,
        color: "#000",
        fontWeight: "500",
    },
    planText: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 10,
    },
    planPrice: {
        fontSize: 22,
        fontWeight: "bold",
        marginVertical: 5,
    },
    trialText: {
        fontSize: 14,
        color: "#333",
        marginBottom: 20,
    },
    subscribeButton: {
        backgroundColor: "red",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginBottom: 20,
    },
    subscribeText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
    footer: {
        fontSize: 16,
        fontWeight: "700",
        color: "red",
        marginBottom: 10,
    },
    disclaimer: {
        fontSize: 12,
        color: "#333",
        textAlign: "center",
    },
    activeSubscriptionButton: {
        backgroundColor: "#28a745", // Green for active subscription
    },
    activeSubscriptionContainer: {
        backgroundColor: "#d4edda",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        borderColor: "#28a745",
        borderWidth: 1,
    },
    activeSubscriptionText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#155724",
        textAlign: "center",
    },
    subscriptionDetails: {
        fontSize: 12,
        color: "#155724",
        textAlign: "center",
        marginTop: 5,
    },
    cancelButton: {
        backgroundColor: "#dc3545",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 12,
        alignSelf: "center",
    },
    cancelText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
});

export default SubscriptionScreen;
