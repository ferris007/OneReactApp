import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Alert, Linking } from "react-native";

interface LocationState {
    locationEnabled: boolean;
    coords: { lat: number; lng: number } | null;
    subscription: Location.LocationSubscription | null;

    setLocationEnabled: (enabled: boolean) => void;
    startLocationTracking: () => Promise<void>;
    stopLocationTracking: () => void;
    reset: () => void
}

export const useUserStore = create<LocationState>()(
    persist(
        (set, get) => ({
            locationEnabled: false,
            coords: null,
            subscription: null,

            setLocationEnabled: (enabled) => set({ locationEnabled: enabled }),

            startLocationTracking: async () => {

                const current = await Location.getForegroundPermissionsAsync();
                console.log("CURRENT", current);

                if (current.status === "undetermined") {
                    // First time → ask for permission
                    const { status } = await Location.requestForegroundPermissionsAsync();

                    if (status !== "granted") {
                        set({ locationEnabled: false });
                        console.log("❌ Permission denied first time, no alert shown");
                        return;
                    }
                } else if (current.status === "denied") {
                    // Already denied before
                    if (!current.canAskAgain) {
                        Alert.alert(
                            "Location Permission Needed",
                            "Please enable location access in your device settings.",
                            [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "Open Settings",
                                    onPress: async () => {
                                        await Linking.openSettings();
                                    },
                                },
                            ]
                        );
                    }
                    set({ locationEnabled: false });
                    return;
                }







                // if already tracking, stop first
                const prevSub = get().subscription;
                if (prevSub) {
                    prevSub.remove();
                }

                const sub = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 5000,
                        distanceInterval: 10,
                    },
                    (loc) => {
                        set({
                            coords: {
                                lat: loc.coords.latitude,
                                lng: loc.coords.longitude,
                            },
                        });
                    }
                );

                set({ subscription: sub, locationEnabled: true });
            },

            stopLocationTracking: () => {
                const sub = get().subscription;
                if (sub) {
                    sub.remove();
                }
                set({ subscription: null, locationEnabled: false, coords: null });
            },

            // 🔹 Reset everything (for logout)
            reset: () => {
                const sub = get().subscription;
                if (sub) {
                    sub.remove();
                }
                set({ subscription: null, locationEnabled: false, coords: null });
                AsyncStorage.removeItem("user-location-store"); // clear persisted state
            },
        }),
        {
            name: "user-location-store",
            partialize: (state) => ({
                locationEnabled: state.locationEnabled,
                coords: state.coords,
            }),
            storage: {
                getItem: async (name) => {
                    const raw = await AsyncStorage.getItem(name);
                    return raw ? JSON.parse(raw) : null;
                },
                setItem: async (name, value) => {
                    await AsyncStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: async (name) => {
                    await AsyncStorage.removeItem(name);
                },
            },
        }
    )
);

