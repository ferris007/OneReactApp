import type { BodyMetrics } from "./types";

export function mockMetrics(): BodyMetrics {
    const weight = 70 + Math.random() * 5; // random weight between 70–75 kg
    const bodyFat = 18 + Math.random() * 5; // random body fat % between 18–23%
    const height = 170 + Math.random() * 5; // random height between 170–175 cm

    return {
        weight_kg: parseFloat(weight.toFixed(1)),
        body_fat_pct: parseFloat(bodyFat.toFixed(1)),
        height: parseFloat(height.toFixed(1)),
        timestamp: new Date().toISOString(),
    };
}

export async function getLatestMetrics(): Promise<BodyMetrics> {
    // simulate async fetch
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockMetrics());
        }, 500);
    });
}
