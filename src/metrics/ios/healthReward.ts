// helpers/appleHealth.ts
import AppleHealthKit, { HealthKitPermissions, HealthValue } from "react-native-health";
import { NativeModules } from "react-native";
import Toast from "react-native-toast-message";

const AppleHealthKitNative = NativeModules.AppleHealthKit;

// Permissions
const PERMS: HealthKitPermissions = {
    permissions: {
        read: [
            AppleHealthKit.Constants.Permissions.BodyMass, // Weight
            AppleHealthKit.Constants.Permissions.BodyMassIndex,
            AppleHealthKit.Constants.Permissions.BodyFatPercentage,
            AppleHealthKit.Constants.Permissions.LeanBodyMass,
            AppleHealthKit.Constants.Permissions.Height,
            AppleHealthKit.Constants.Permissions.Weight,
        ],
        write: [],
    },
};

// Utility: Start of current month (UTC safe)
function getStartOfCurrentMonth(): string {
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0));
    return startOfMonth.toISOString();
}

// Init HealthKit
function initHealthKit(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (AppleHealthKit?.initHealthKit) {
            AppleHealthKit.initHealthKit(PERMS, (err: any) => {
                if (err) return reject(err);
                resolve();
            });
        } else if (AppleHealthKitNative?.initHealthKit) {
            AppleHealthKitNative.initHealthKit(PERMS, (err: any) => {
                if (err) return reject(err);
                resolve();
            });
        } else {
            reject(new Error("AppleHealthKit initialization not available"));
        }
    });
}

// Trusted bundles
const ALLOWED_BUNDLES = new Set([
    "com.withings.wiscale2", // Withings
    "com.fitbit.FitbitMobile", // Fitbit
    "com.renpho.health", // Renpho
    "com.eufylife.eufylife", // Eufy
    "com.mihealth.health", // Mi Health (example)
]);

function isTrustedSample(sample: any, trustedBundleIds: any): boolean {
    const wasUserEntered =
        sample.metadata?.HKWasUserEntered === 1 ||
        sample.metadata?.HKMetadataKeyWasUserEntered === true;
    if (wasUserEntered) return false;

    const bundleId = sample.sourceId || sample.sourceRevision?.source?.bundleIdentifier;
    if (!bundleId) return false;
    if (bundleId === "com.apple.Health") return false;

    if (trustedBundleIds?.length > 0) {
        console.log("TRUSTED BUNDLE IDS", trustedBundleIds, bundleId);


        return trustedBundleIds.includes(bundleId) || !!sample.device;
    } else {
        return ALLOWED_BUNDLES.has(bundleId) || !!sample.device;

    }

}

function extractValidEntries(entries: any[], trustedBundleIds: any): any[] {
    console.log("ENTRIESS", entries);

    const validEntries = entries
        .filter((item) => isTrustedSample(item, trustedBundleIds))
        .sort(
            (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
        );

    console.log("VALID ENTRIES", validEntries);
    return validEntries;
}

// Fetch all trusted weight entries for current month
export function getLatestWeightKg(trustedBundleIds: string[]): Promise<any[] | null> {
    const options = {
        startDate: getStartOfCurrentMonth(),
        endDate: new Date().toISOString(),
        unit: AppleHealthKit.Constants.Units.gram,
    };
    console.log("OPTIONS", options);


    return new Promise((resolve, reject) => {
        const handler = (err: any, res: any[]) => {
            console.log("ERROR", err);

            if (err) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Weight not found"
                })
                return reject(err)
            };
            if (!res || res.length === 0) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Weight not found"
                })

                return resolve(null)
            };
            let claims = prepareWeightProofClaim(res, trustedBundleIds)
            console.log("CLAIMS ", claims);

            // const validEntries = extractValidEntries(res, trustedBundleIds);

            resolve(claims);
        };

        if (AppleHealthKit?.getWeightSamples) {
            AppleHealthKit.getWeightSamples(options, handler);
        } else if (AppleHealthKitNative?.getWeightSamples) {
            AppleHealthKitNative.getWeightSamples(options, handler);
        } else {
            reject(new Error("Weight retrieval not available"));
        }
    });
}

// Public API
export async function connectAndGetWeights(trustedBundleIds: any): Promise<any[] | null> {
    try {
        await initHealthKit();
        return await getLatestWeightKg(trustedBundleIds);
    } catch (e) {
        console.error("AppleHealthKit weight fetch failed", e);
        return null;
    }
}
















































interface WeightSample {
    startDate: string,
    endDate: string
    date: string; // ISO date string
    kg: string;
    sourceBundle: string;
    value: number,
    sourceId: string;
    device?: {
        model?: string;
        manufacturer?: string;
    };
    wasUserEntered: boolean;
}

interface WeightPair {
    startSample: WeightSample;
    endSample: WeightSample;
    daysBetween: number;
    weightChangeLbs: number; // Positive = loss, Negative = gain
    isEligible: boolean;
    rewardType: 'weight_loss' | 'muscle_gain' | null;
    potentialReward: number; // VII tokens
}

// Trusted scale app bundle IDs
const TRUSTED_BUNDLES = new Set([
    'com.withings.wiscale2',
    'com.renpho.health',
    'com.eufylife.eufylife',
    'com.fitbit.FitbitMobile',
    'com.xiaomi.hm.health',
    'com.tanita.healthplanet'
]);

const BLOCKED_BUNDLES = new Set(['com.apple.Health']);

// Validation constants
const MIN_DAYS_BETWEEN = 27;
const MIN_WEIGHT_LOSS_LBS = 4.0;
const MIN_MUSCLE_GAIN_LBS = 3.0;
const WEIGHT_LOSS_REWARD = 20.0;
const MUSCLE_GAIN_REWARD = 15.0;

function isTrustedWeight(sample: WeightSample, trustedBundleIds: string[]): boolean {
    console.log("SAMPLES", sample);



    // 1. Reject manual entries
    if (sample?.wasUserEntered || sample?.metadata?.HKWasUserEntered === 1) {
        // Toast.show({
        //     type: "error",
        //     text1: "Error",
        //     text2: "Manual entries found"
        // })
        return false

    };
    console.log("SAMPLES Not Entered", sample);

    // 2. Reject Apple Health manual entries
    if (BLOCKED_BUNDLES?.has(sample.sourceBundle)) return false;

    // 3. Tier A: Device-backed samples (highest trust)
    if (sample.device && (sample.device.model || sample.device.manufacturer)) {
        return true;
    }
    if (trustedBundleIds?.length > 0) {
        return trustedBundleIds.includes(sample?.sourceId);
    } else {
        return TRUSTED_BUNDLES.has(sample?.sourceId);
    }
    // 4. Tier B: Known scale apps without device
}

function calculateDaysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
}

function kgToLbs(kg: number): number {
    return kg * 2.20462;
}

function evaluateWeightPair(start: WeightSample, end: WeightSample): WeightPair {

    console.log("start", start.startDate, end.endDate);




    const daysBetween = calculateDaysBetween(start.startDate, end.endDate);
    const weightChangeKg = (start?.value) / 1000 - (end?.value) / 1000; // Positive = loss, Negative = gain
    const weightChangeLbs = kgToLbs(weightChangeKg);


    console.log("daysBetween", daysBetween, weightChangeKg, weightChangeLbs);


    let isEligible = false;
    let rewardType: 'weight_loss' | 'muscle_gain' | null = null;
    let potentialReward = 0;

    // Check time requirement
    if (daysBetween >= MIN_DAYS_BETWEEN) {
        // Check weight loss eligibility
        if (weightChangeLbs >= MIN_WEIGHT_LOSS_LBS) {
            isEligible = true;
            rewardType = 'weight_loss';
            potentialReward = WEIGHT_LOSS_REWARD;
        }
        // Check muscle gain eligibility  
        else if (Math.abs(weightChangeLbs) >= MIN_MUSCLE_GAIN_LBS && weightChangeLbs < 0) {
            isEligible = true;
            rewardType = 'muscle_gain';
            potentialReward = MUSCLE_GAIN_REWARD;
        }
    }

    return {
        startSample: start,
        endSample: end,
        daysBetween,
        weightChangeLbs,
        isEligible,
        rewardType,
        potentialReward
    };
}

export function findBestWeightPair(allSamples: WeightSample[], trustedBundleIds: string[]): WeightPair | null {
    // 1. Filter to trusted samples only
    const trustedSamples = allSamples.filter(sample =>
        isTrustedWeight(sample, trustedBundleIds)
    );
    console.log("TRSUTED SAMPLES", trustedSamples);

    console.log("trustedSamplestrustedSamples", trustedSamples);


    if (trustedSamples.length < 2) {


        return null; // Need at least 2 trusted samples
    }

    // 2. Sort by date (oldest first)
    const sortedSamples = trustedSamples.sort((a, b) =>
        new Date(a.startDate).getTime() - new Date(b.endDate).getTime()
    );


    console.log("SORTED SAMPLES", sortedSamples);

    // 3. Find all valid pairs and evaluate them
    const validPairs: WeightPair[] = [];

    for (let i = 0; i < sortedSamples.length - 1; i++) {
        for (let j = i + 1; j < sortedSamples.length; j++) {
            const pair = evaluateWeightPair(sortedSamples[i], sortedSamples[j]);

            if (pair.isEligible) {
                validPairs.push(pair);
            }
        }
    }

    console.log("VALID PAIRS", validPairs);


    if (validPairs.length === 0) {
        // Toast.show({
        //     type: "error",
        //     text1: "Error",
        //     text2: "No eligible weight pairs found for reward calculation"
        // })
        return null; // No eligible pairs found
    }

    // 4. Find the best pair using scoring algorithm
    const bestPair = validPairs.reduce((best, current) => {
        // Prioritize by reward amount first, then by weight change magnitude
        const bestScore = best.potentialReward + Math.abs(best.weightChangeLbs) * 0.1;
        const currentScore = current.potentialReward + Math.abs(current.weightChangeLbs) * 0.1;

        return currentScore > bestScore ? current : best;
    });


    console.log("BEST OAIR", bestPair);


    return bestPair;
}

// Helper function to get current month trusted samples for API submission
export function getCurrentMonthTrustedSamples(
    allSamples: WeightSample[],
    trustedBundleIds: string[]
): WeightSample[] {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return allSamples
        .filter(sample => isTrustedWeight(sample, trustedBundleIds)) // ✅ pass trustedBundleIds here
        .filter(sample => {
            console.log("SAMPLEEE", sample);

            const sampleDate = new Date(sample.startDate);
            return (
                sampleDate.getMonth() === currentMonth &&
                sampleDate.getFullYear() === currentYear
            );
        });
}

// Usage example:
export function prepareWeightProofClaim(allSamples: WeightSample[], trustedBundleIds: string[]) {
    const bestPair = findBestWeightPair(allSamples, trustedBundleIds);
    let errors: string[] = []
    console.log("NEW BEST PAit", bestPair);
    if (!bestPair) {
        Toast.show({
            type: "error",
            text1: "Error",
            text2: "No eligible weight measurements found for reward claim"
        })
        errors.push("No eligible weight measurements found for reward claim.Please read above requirements")

        // throw new Error('No eligible weight measurements found for reward claim');
    }

    const monthlySamples = getCurrentMonthTrustedSamples(allSamples, trustedBundleIds);

    if (monthlySamples.length < 3) {
        errors.push("Need at least 3 trusted weigh-ins this month for reward eligibility.Please read above requirements")
    }


    if (errors?.length === 0) {
        return {
            weightProof: {
                startDate: bestPair?.startSample?.startDate,
                endDate: bestPair?.endSample.endDate,
                startKg: (bestPair?.startSample.value) / 1000,
                endKg: (bestPair?.endSample.value) / 1000,
                startSourceBundle: bestPair?.startSample.sourceId,
                endSourceBundle: bestPair?.endSample.sourceId,
                startDevice: bestPair?.startSample?.device || null,
                endDevice: bestPair?.endSample.device || null,
                lossLbs: bestPair?.weightChangeLbs,
                daysBetween: bestPair?.daysBetween
            },
            userEnteredFlags: [
                bestPair?.startSample.wasUserEntered ? true : false,
                bestPair?.endSample.wasUserEntered ? true : false
            ],
            monthlySamples: monthlySamples,
            potentialReward: bestPair?.potentialReward,
            rewardType: bestPair?.rewardType
        };
    } else {
        return { errors: errors }
    }
}