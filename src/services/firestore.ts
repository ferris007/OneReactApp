import { BodyMetrics } from "../metrics/types";
import {
    collection,
    addDoc,
    serverTimestamp,
    Firestore,
} from "firebase/firestore";

/**
 * Save a metric entry for a user
 * @param db - Firestore instance (from getFirestore(app))
 * @param userId - Firebase Auth UID
 * @param metric - BodyMetrics data
 */
export async function saveMetric(
    db: Firestore,
    userId: string,
    metric: BodyMetrics
) {
    const userMetricsRef = collection(db, "users", userId, "metrics");

    await addDoc(userMetricsRef, {
        ...metric,
        createdAt: serverTimestamp(),
    });
}
