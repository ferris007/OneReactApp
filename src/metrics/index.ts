import { Platform } from "react-native";
import * as Mock from "./mock";
import * as IOSHealth from "./ios/health";
import * as AndroidHC from "./android/healthConnect";

export const MetricsProvider =
    Platform.OS === "ios"
        ? IOSHealth
        : Platform.OS === "android"
            ? AndroidHC
            : Mock;