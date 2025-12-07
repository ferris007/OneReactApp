import {
    initialize,
    requestPermission,
    readRecords,
    type HealthPermission,
} from 'react-native-health-connect';
import HealthConnect from 'react-native-health-connect';
import type { BodyMetrics } from '../types';
import { latest, normalizePercentage } from '../../utils/units';

export async function readLatestMetricsHC(): Promise<BodyMetrics & { available: boolean; reason?: string }> {
    const available = await HealthConnect?.isAvailable();
    if (!available) return { available: false, reason: 'HealthConnectNotInstalled', source: 'none', weight_kg: null, body_fat_pct: null, bmi: null, lean_mass_kg: null };

    await initialize();

    const perms: HealthPermission[] = [
        { accessType: 'read', recordType: 'Weight' },
        { accessType: 'read', recordType: 'BodyFat' },
        { accessType: 'read', recordType: 'LeanBodyMass' },
        { accessType: 'read', recordType: 'Height' },
        { accessType: 'read', recordType: 'BodyMassIndex' },
    ];

    await requestPermission(perms);

    const now = new Date();
    const start = new Date(now.getTime() - 30 * 24 * 3600 * 1000);

    const [weights, fats, leans, heights, bmis] = await Promise.all([
        readRecords('Weight', { timeRangeFilter: { startTime: start, endTime: now } }),
        readRecords('BodyFat', { timeRangeFilter: { startTime: start, endTime: now } }),
        readRecords('LeanBodyMass', { timeRangeFilter: { startTime: start, endTime: now } }),
        readRecords('Height', { timeRangeFilter: { startTime: start, endTime: now } }),
        readRecords('BodyMassIndex', { timeRangeFilter: { startTime: start, endTime: now } }),
    ]);

    // pick latest by time/endTime
    const lw: any = latest(weights as unknown as any[], (r: any) => r.time ?? r.endTime);
    const lf: any = latest(fats as unknown as any[], (r: any) => r.time ?? r.endTime);
    const ll: any = latest(leans as unknown as any[], (r: any) => r.time ?? r.endTime);
    const lh: any = latest(heights as unknown as any[], (r: any) => r.time ?? r.endTime);
    const lbmi: any = latest(bmis as unknown as any[], (r: any) => r.time ?? r.endTime);

    const weight_kg = lw?.weight?.inKg ?? null;
    const lean_mass_kg = ll?.mass?.inKg ?? null;
    const body_fat_pct = normalizePercentage(lf?.percentage);
    const bmi = lbmi?.bmi ?? null;

    return {
        available: true,
        platform: 'android',
        source: 'health_connect',
        weight_kg,
        body_fat_pct,
        bmi,
        lean_mass_kg,
        measured_at: new Date().toISOString(),
    } as any;
}