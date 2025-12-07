import HealthKit, {
    HealthKitPermissions,
    HealthValue,
} from "react-native-health";
import { NativeModules } from "react-native";

// Access the native module directly as a fallback
const AppleHealthKitNative = NativeModules.AppleHealthKit;

// Debug: Log what's available
console.log("Available NativeModules:", Object.keys(NativeModules));
console.log("AppleHealthKitNative:", AppleHealthKitNative);

// Test if we can access the native module directly
if (AppleHealthKitNative) {
    console.log("Native module methods:", Object.getOwnPropertyNames(AppleHealthKitNative));
    console.log("Native module prototype:", Object.getPrototypeOf(AppleHealthKitNative));
}

import type { BodyMetrics } from "../types";
import { normalizePercentage } from "../../utils/units";
import Toast from "react-native-toast-message";

const PERMS: HealthKitPermissions = {
    permissions: {
        read: [
            HealthKit.Constants.Permissions.BodyMass,         // Weight
            HealthKit.Constants.Permissions.BodyMassIndex,    // BMI
            HealthKit.Constants.Permissions.BodyFatPercentage,
            HealthKit.Constants.Permissions.LeanBodyMass,
            HealthKit.Constants.Permissions.Height,
            HealthKit.Constants.Permissions.Weight,
        ],
        write: [],
    },
};

function initHealthKit(): Promise<void> {
    console.log("NATIVE MODULES", NativeModules);
    console.log("HealthKit object:", HealthKit);
    console.log("Available methods:", Object.getOwnPropertyNames(HealthKit));
    console.log("Native AppleHealthKit:", AppleHealthKitNative);

    if (AppleHealthKitNative) {
        console.log("Native module methods:", Object.getOwnPropertyNames(AppleHealthKitNative));
    }

    return new Promise((resolve, reject) => {
        // Try the HealthKit object first
        if (HealthKit && typeof HealthKit.initHealthKit === 'function') {
            HealthKit.initHealthKit(PERMS, (err: any) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        }
        // Fallback to native module
        else if (AppleHealthKitNative && typeof AppleHealthKitNative.initHealthKit === 'function') {
            AppleHealthKitNative.initHealthKit(PERMS, (err: any) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        }
        else {
            console.error('HealthKit.initHealthKit is not available on either object');
            reject(new Error('HealthKit initialization not available'));
        }
    });
}

function getLatestWeightKg(): Promise<number | null> {
    return new Promise((resolve, reject) => {

        if (HealthKit && typeof HealthKit.getLatestWeight === 'function') {
            console.log("ENTEREDDD",);

            HealthKit.getLatestWeight({ unit: HealthKit.Constants.Units.gram }, (err: any, res?: HealthValue) => {
                console.log("ERRORORR", err, res);


                if (err) {
                    resolve(null)
                } else {
                    resolve(res?.value != null ? Number(res.value) / 1000 : null);

                }



                // Convert grams to kilograms
            });
        } else if (AppleHealthKitNative && typeof AppleHealthKitNative.getLatestWeight === 'function') {
            console.log("ENTEREDDD 222",);

            AppleHealthKitNative.getLatestWeight({ unit: HealthKit.Constants.Units.gram }, (err: any, res?: HealthValue) => {
                console.log("ERRORORR 22", err, res);

                if (err) {

                    resolve(null)
                } else {
                    resolve(res?.value != null ? Number(res.value) / 1000 : null);
                }
                // Convert grams to kilograms
            });
        } else {
            console.log('getLatestWeight is not available on either object');
            reject(new Error('Weight retrieval not available'));
        }
    });
}

function getLatestBMI(): Promise<number | null> {
    return new Promise((resolve, reject) => {
        if (HealthKit && typeof HealthKit.getLatestBmi === 'function') {
            console.log("ENTEREDDD 33",);

            HealthKit.getLatestBmi({}, (err: any, res?: HealthValue) => {
                if (err) return reject(err);
                resolve(res?.value != null ? Number(res.value) : null);
            });
        } else if (AppleHealthKitNative && typeof AppleHealthKitNative.getLatestBmi === 'function') {
            console.log("ENTEREDDD 44",);

            AppleHealthKitNative.getLatestBmi({}, (err: any, res?: HealthValue) => {
                console.log("ENTEREDDD 55", err, res);
                if (err) {
                    resolve(null)
                } else {
                    resolve(res?.value != null ? Number(res.value) : null);
                }

            });
        } else {
            console.error('getLatestBmi is not available on either object');
            reject(new Error('BMI retrieval not available'));
        }
    });
}

function getLatestBodyFatPct(): Promise<number | null> {
    return new Promise((resolve, reject) => {
        if (HealthKit && typeof HealthKit.getLatestBodyFatPercentage === 'function') {
            HealthKit.getLatestBodyFatPercentage({}, (err: any, res?: HealthValue) => {
                if (err) return reject(err);
                const val = res?.value != null ? Number(res.value) : null;
                resolve(normalizePercentage(val));
            });
        } else if (AppleHealthKitNative && typeof AppleHealthKitNative.getLatestBodyFatPercentage === 'function') {
            AppleHealthKitNative.getLatestBodyFatPercentage({ unit: HealthKit.Constants.Units.percent }, (err: any, res?: HealthValue) => {
                if (err) {
                    resolve(null)
                } else {
                    const val = res?.value != null ? Number(res.value) : null;
                    resolve(normalizePercentage(val));
                }
            });
        } else {
            console.error('getLatestBodyFatPercentage is not available on either object');
            reject(new Error('Body fat percentage retrieval not available'));
        }
    });
}

function getLatestLeanBodyMassKg(): Promise<number | null> {
    return new Promise((resolve, reject) => {
        if (HealthKit && typeof HealthKit.getLatestLeanBodyMass === 'function') {
            HealthKit.getLatestLeanBodyMass({ unit: HealthKit.Constants.Units.gram }, (err: any, res?: HealthValue) => {
                if (err) return reject(err);
                // Convert grams to kilograms
                resolve(res?.value != null ? Number(res.value) / 1000 : null);
            });
        } else if (AppleHealthKitNative && typeof AppleHealthKitNative.getLatestLeanBodyMass === 'function') {
            AppleHealthKitNative.getLatestLeanBodyMass({ unit: HealthKit.Constants.Units.gram }, (err: any, res?: HealthValue) => {

                if (err) {
                    resolve(null)
                } else {
                    resolve(res?.value != null ? Number(res.value) / 1000 : null);
                }

            });
        } else {
            console.error('getLatestLeanBodyMass is not available on either object');
            reject(new Error('Lean body mass retrieval not available'));
        }
    });
}

function getLatestHeight(): Promise<number | null> {
    return new Promise((resolve, reject) => {
        if (HealthKit && typeof HealthKit.getLatestHeight === 'function') {
            HealthKit.getLatestHeight({ unit: HealthKit.Constants.Units.meter }, (err: any, res?: HealthValue) => {
                if (err) return reject(err);
                resolve(res?.value != null ? Number(res.value) : null);
            });
        } else if (AppleHealthKitNative && typeof AppleHealthKitNative.getLatestHeight === 'function') {
            AppleHealthKitNative.getLatestHeight({ unit: HealthKit.Constants.Units.meter }, (err: any, res?: HealthValue) => {

                if (err) {
                    resolve(null)
                } else {
                    resolve(res?.value != null ? Number(res.value) : null);

                }


                if (err) return reject(err);
            });
        } else {
            console.error('getLatestHeight is not available on either object');
            reject(new Error('Height retrieval not available'));
        }
    });
}

// Public API
export async function connect(): Promise<boolean> {
    try {
        await initHealthKit();
        return true;
    } catch (e) {
        console.error("HealthKit connection failed", e);
        return false;
    }
}

export async function getLatestMetrics(): Promise<BodyMetrics> {
    // const [weight_kg, bmi, body_fat_pct, lean_mass_kg, height] = await Promise.all([
    //     getLatestWeightKg(),
    //     getLatestBMI(),
    //     getLatestBodyFatPct(),
    //     getLatestLeanBodyMassKg(),
    //     getLatestHeight(),
    // ]);
    const weight = await getLatestWeightKg();

    const bmi = await getLatestBMI();

    const bodyFat = await getLatestBodyFatPct();

    const muscleMass = await getLatestLeanBodyMassKg();

    const height = await getLatestHeight();



    return {
        // platform: "ios",
        // source: "apple_health",
        weight,
        bodyFat,
        bmi,
        muscleMass,
        height,
        // measured_at: new Date().toISOString(),
    };
}
